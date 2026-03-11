import { NextResponse } from "next/server";

import { isAuthorizedRequest, unauthorizedResponse } from "@/lib/auth";
import { sendGmailMessage } from "@/lib/gmail";
import { findDuplicateApplication, insertApplication } from "@/lib/supabase";
import { ParsedPrompt } from "@/lib/types";

export const runtime = "nodejs";

type SendApplicationPayload = {
  parsed?: ParsedPrompt;
  subject?: string;
  body?: string;
};

export async function POST(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      return unauthorizedResponse();
    }

    const { parsed, subject, body } = (await request.json()) as SendApplicationPayload;
    if (!parsed || !subject || !body) {
      return NextResponse.json({ error: "Parsed prompt, subject, and body are required." }, { status: 400 });
    }

    const duplicate = await findDuplicateApplication(parsed.company, parsed.role);
    if (duplicate) {
      return NextResponse.json(
        { error: "An application already exists for this company and role." },
        { status: 409 },
      );
    }

    await sendGmailMessage({
      to: parsed.email,
      subject,
      body,
    });

    const record = await insertApplication({
      company: parsed.company,
      role: parsed.role,
      recruiter_email: parsed.email,
      batch: parsed.batch,
      ctc: parsed.ctc,
      location: parsed.location,
      status: "sent",
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
