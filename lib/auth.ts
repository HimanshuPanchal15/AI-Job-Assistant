import { NextResponse } from "next/server";

export function isAuthorizedRequest(request: Request) {
  const expectedToken = process.env.APP_ADMIN_TOKEN;
  if (!expectedToken) {
    throw new Error("Missing APP_ADMIN_TOKEN environment variable.");
  }

  const suppliedToken = request.headers.get("x-admin-token");
  return suppliedToken === expectedToken;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}
