import { ParsedPrompt } from "@/lib/types";

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function fallbackEmail(company: string, role: string): { subject: string; body: string } {
  return {
    subject: `Application for ${role} at ${company}`,
    body:
      `Dear Hiring Team,\n\n` +
      `I am excited to apply for the ${role} position at ${company}. My background aligns well with the role's requirements, and I would welcome the opportunity to contribute to your team.\n\n` +
      `I have attached my resume for your review and would be glad to discuss how my technical skills, project experience, and problem-solving approach can support your team.\n\n` +
      `Thank you for your time and consideration.\n\n` +
      `Best regards,\n[Your Name]`,
  };
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

export async function extractPromptDetails(prompt: string): Promise<ParsedPrompt | null> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }

  const extractionPrompt = `
You extract structured job application fields from messy pasted text.
Return valid JSON with exactly these keys:
"company", "role", "batch", "ctc", "location", "job_description", "email"

Rules:
- Extract the actual recruiter/application email if one appears anywhere in the text.
- Do not infer or guess batch eligibility. Set "batch" to an empty string unless the prompt states it explicitly.
- "job_description" should contain the main role description text without the final email/contact line.
- Do not invent values.
- Use empty strings only if a field is truly missing.

Text:
${prompt}
`.trim();

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: extractionPrompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.1,
        return_full_text: false,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  const generatedText = Array.isArray(data) ? data[0]?.generated_text ?? "" : data.generated_text ?? "";
  const jsonText = extractJsonObject(generatedText);

  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as ParsedPrompt;
    if (
      !parsed.company ||
      !parsed.role ||
      !parsed.ctc ||
      !parsed.location ||
      !parsed.job_description ||
      !parsed.email ||
      !EMAIL_PATTERN.test(parsed.email)
    ) {
      return null;
    }

    return {
      company: parsed.company.trim(),
      role: parsed.role.trim(),
      batch: parsed.batch?.trim() ?? "",
      ctc: parsed.ctc.trim(),
      location: parsed.location.trim(),
      job_description: parsed.job_description.trim(),
      email: parsed.email.trim(),
    };
  } catch {
    return null;
  }
}

export async function generateApplicationEmail(input: {
  company: string;
  role: string;
  batch: string;
  ctc: string;
  location: string;
  jobDescription: string;
}): Promise<{ subject: string; body: string }> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return fallbackEmail(input.company, input.role);
  }

  const prompt = `
You are a professional career assistant. Write a concise, polished job application email.
Return valid JSON with exactly two keys: "subject" and "body".

Company: ${input.company}
Role: ${input.role}
Batch: ${input.batch}
Compensation: ${input.ctc}
Location: ${input.location}
Job Description:
${input.jobDescription}

Requirements:
- Professional subject line
- Friendly greeting
- Brief introduction
- Mention relevant skills inferred from the job description
- Strong concise closing
- Keep the email body under 220 words
`.trim();

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.35,
        return_full_text: false,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return fallbackEmail(input.company, input.role);
  }

  const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  const generatedText = Array.isArray(data) ? data[0]?.generated_text ?? "" : data.generated_text ?? "";

  try {
    const parsed = JSON.parse(generatedText) as { subject: string; body: string };
    if (!parsed.subject || !parsed.body) {
      throw new Error("Invalid response shape");
    }
    return {
      subject: parsed.subject.trim(),
      body: parsed.body.trim(),
    };
  } catch {
    return fallbackEmail(input.company, input.role);
  }
}
