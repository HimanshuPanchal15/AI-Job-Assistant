import pdfParse from "pdf-parse";

import { getResumeAsset } from "@/lib/resumeAsset";
import { ResumeAnalysisResponse } from "@/lib/types";

const SKILL_PATTERNS = [
  "python",
  "fastapi",
  "django",
  "flask",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "postgresql",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "distributed systems",
  "rest api",
  "graphql",
  "tailwind",
  "machine learning",
  "nlp",
  "ci/cd",
  "git",
];

export async function extractResumeText(): Promise<string> {
  try {
    const asset = await getResumeAsset();
    if (!asset) {
      return "";
    }

    const parsed = await pdfParse(asset.buffer);
    return parsed.text.trim();
  } catch {
    return "";
  }
}

export async function analyzeResumeAgainstJob(jobDescription: string): Promise<ResumeAnalysisResponse> {
  const resumeText = await extractResumeText();
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const keySkills = SKILL_PATTERNS.filter((skill) => jdLower.includes(skill));
  const matchedSkills = keySkills.filter((skill) => resumeLower.includes(skill));
  const score = keySkills.length ? Math.round((matchedSkills.length / keySkills.length) * 100) : resumeText ? 55 : 0;
  const missingSkills = keySkills.filter((skill) => !matchedSkills.includes(skill));

  const suggestedResumeImprovements =
    missingSkills.slice(0, 3).map((skill) => `Highlight measurable experience with ${skill}.`) ||
    [];

  if (!resumeText) {
    suggestedResumeImprovements.unshift("Provide a private resume via RESUME_BASE64 or RESUME_FILE_PATH so the app can attach and analyze it.");
  }

  if (!suggestedResumeImprovements.length) {
    suggestedResumeImprovements.push("Tailor the resume summary section to mirror the role's core responsibilities.");
  }

  return {
    match_score: Math.max(0, Math.min(score, 100)),
    key_required_skills: keySkills.slice(0, 8),
    suggested_resume_improvements: suggestedResumeImprovements,
    resume_excerpt: resumeText ? `${resumeText.slice(0, 400)}${resumeText.length > 400 ? "..." : ""}` : "No resume text extracted yet.",
  };
}

export function getRecruiterEmailWarning(company: string, email: string): string | null {
  const recruiterDomain = email.split("@")[1]?.toLowerCase();
  const normalizedCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!recruiterDomain || !normalizedCompany) {
    return null;
  }

  return recruiterDomain.includes(normalizedCompany)
    ? null
    : "Recruiter email domain does not appear to match the company name. Verify before sending.";
}
