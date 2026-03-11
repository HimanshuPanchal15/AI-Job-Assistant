import { extractPromptDetails } from "@/lib/huggingface";
import { ParsedPrompt } from "@/lib/types";

const EMAIL_PATTERN = /<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i;

function extractEmail(value: string) {
  return value.match(EMAIL_PATTERN)?.[1] ?? "";
}

function findEmailLine(lines: string[]) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const email = extractEmail(lines[index] ?? "");
    if (email) {
      return { index, email };
    }
  }

  return null;
}

function extractLabeledValue(line: string, label: RegExp) {
  const match = line.match(label);
  return match?.at(-1)?.trim() ?? "";
}

function parsePromptDeterministically(prompt: string): ParsedPrompt {
  const lines = prompt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const company = lines[0] ?? "";
  const role = lines[1] ?? "";
  const emailLine = findEmailLine(lines);
  const email = emailLine?.email ?? "";
  const detailLines = lines.slice(2, emailLine?.index ?? lines.length);

  let batch = "";
  let ctc = "";
  let location = "";
  const jobDescriptionLines: string[] = [];

  for (const line of detailLines) {
    const batchValue = extractLabeledValue(line, /^batch\s*:\s*(.+)$/i);
    if (batchValue) {
      batch = batchValue;
      continue;
    }

    const ctcValue = extractLabeledValue(line, /^(?:ctc|compensation|salary)\s*:\s*(.+)$/i);
    if (ctcValue) {
      ctc = ctcValue;
      continue;
    }

    const locationValue = extractLabeledValue(line, /^location\s*:\s*(.+)$/i);
    if (locationValue) {
      location = locationValue;
      continue;
    }

    const jobDescriptionValue = extractLabeledValue(line, /^job description\s*:\s*(.*)$/i);
    if (jobDescriptionValue || /^job description\s*:/i.test(line)) {
      if (jobDescriptionValue) {
        jobDescriptionLines.push(jobDescriptionValue);
      }
      continue;
    }

    jobDescriptionLines.push(line);
  }

  const job_description = jobDescriptionLines.join("\n").trim();

  if (!company || !role || !job_description || !email) {
    throw new Error("Prompt must include at least the company, role, job description, and an application email.");
  }

  return {
    company,
    role,
    batch,
    ctc,
    location,
    job_description,
    email,
  };
}

export async function parsePrompt(prompt: string): Promise<ParsedPrompt> {
  try {
    return parsePromptDeterministically(prompt);
  } catch (deterministicError) {
    const aiParsed = await extractPromptDetails(prompt);
    if (aiParsed) {
      return aiParsed;
    }

    throw deterministicError;
  }
}
