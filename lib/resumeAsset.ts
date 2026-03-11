import fs from "node:fs/promises";
import path from "node:path";

export type ResumeAsset = {
  filename: string;
  buffer: Buffer;
};

function getConfiguredResumePath() {
  return process.env.RESUME_FILE_PATH || path.join(process.cwd(), "private", "resume.pdf");
}

export async function getResumeAsset(): Promise<ResumeAsset | null> {
  const resumeBase64 = process.env.RESUME_BASE64?.trim();
  if (resumeBase64) {
    try {
      return {
        filename: "resume.pdf",
        buffer: Buffer.from(resumeBase64, "base64"),
      };
    } catch {
      return null;
    }
  }

  try {
    const configuredPath = getConfiguredResumePath();
    const buffer = await fs.readFile(configuredPath);
    return {
      filename: path.basename(configuredPath),
      buffer,
    };
  } catch {
    return null;
  }
}
