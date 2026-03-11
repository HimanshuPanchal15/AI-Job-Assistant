import { NextResponse } from "next/server";

import { isAuthorizedRequest, unauthorizedResponse } from "@/lib/auth";
import { getApplications } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedRequest(request)) {
      return unauthorizedResponse();
    }

    const applications = await getApplications();
    return NextResponse.json(applications);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch applications.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
