import { NextResponse } from "next/server";

import { generateApplicationEmail } from "@/lib/huggingface";
import { parsePrompt } from "@/lib/parsePrompt";
import { getRecruiterEmailWarning } from "@/lib/resume";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const parsed = await parsePrompt(prompt);
    const generated = await generateApplicationEmail({
      company: parsed.company,
      role: parsed.role,
      batch: parsed.batch,
      ctc: parsed.ctc,
      location: parsed.location,
      jobDescription: parsed.job_description,
    });

    return NextResponse.json({
      parsed,
      subject: generated.subject,
      body: generated.body,
      warning: getRecruiterEmailWarning(parsed.company, parsed.email),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate email.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
