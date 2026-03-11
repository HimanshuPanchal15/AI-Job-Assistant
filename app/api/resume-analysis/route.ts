import { NextResponse } from "next/server";

import { isAuthorizedRequest, unauthorizedResponse } from "@/lib/auth";
import { parsePrompt } from "@/lib/parsePrompt";
import { analyzeResumeAgainstJob } from "@/lib/resume";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      return unauthorizedResponse();
    }

    const { prompt } = (await request.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const parsed = await parsePrompt(prompt);
    const analysis = await analyzeResumeAgainstJob(parsed.job_description);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze resume.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
