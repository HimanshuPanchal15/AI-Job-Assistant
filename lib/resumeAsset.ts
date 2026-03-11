import fs from "node:fs/promises";
import path from "node:path";

import { getSupabaseClient } from "@/lib/supabase";

export type ResumeAsset = {
  filename: string;
  buffer: Buffer;
};

function getSupabaseResumeConfig() {
  const bucket = process.env.SUPABASE_RESUME_BUCKET?.trim();
  const objectPath = process.env.SUPABASE_RESUME_PATH?.trim();

  if (!bucket || !objectPath) {
    return null;
  }

  return { bucket, objectPath };
}

function getConfiguredResumePath() {
  return process.env.RESUME_FILE_PATH || path.join(process.cwd(), "private", "resume.pdf");
}

async function getSupabaseResumeAsset(): Promise<ResumeAsset | null> {
  const config = getSupabaseResumeConfig();
  if (!config) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage.from(config.bucket).download(config.objectPath);

    if (error || !data) {
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return {
      filename: path.basename(config.objectPath),
      buffer: Buffer.from(arrayBuffer),
    };
  } catch {
    return null;
  }
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

  const supabaseAsset = await getSupabaseResumeAsset();
  if (supabaseAsset) {
    return supabaseAsset;
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
