export type ParsedPrompt = {
  company: string;
  role: string;
  batch: string;
  ctc: string;
  location: string;
  job_description: string;
  email: string;
};

export type GeneratedEmailResponse = {
  parsed: ParsedPrompt;
  subject: string;
  body: string;
  warning?: string | null;
};

export type ResumeAnalysisResponse = {
  match_score: number;
  key_required_skills: string[];
  suggested_resume_improvements: string[];
  resume_excerpt: string;
};

export type PreviewState = GeneratedEmailResponse & {
  rawPrompt: string;
  analysis?: ResumeAnalysisResponse;
  adminToken?: string;
};

export type ApplicationRecord = {
  id: string;
  company: string;
  role: string;
  recruiter_email: string;
  batch: string;
  ctc: string;
  location: string;
  date_applied: string;
  status: string;
};
