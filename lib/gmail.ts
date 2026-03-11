import { google } from "googleapis";

import { getResumeAsset } from "@/lib/resumeAsset";

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function encodeMessage(message: string) {
  return Buffer.from(message).toString("base64url");
}

function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendGmailMessage(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const senderEmail = sanitizeHeaderValue(process.env.GMAIL_SENDER_EMAIL ?? "");
  const recipientEmail = sanitizeHeaderValue(input.to);
  const subject = sanitizeHeaderValue(input.subject);

  if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
    throw new Error("Missing Gmail API environment variables.");
  }

  if (!EMAIL_PATTERN.test(senderEmail)) {
    throw new Error("GMAIL_SENDER_EMAIL is invalid.");
  }

  if (!EMAIL_PATTERN.test(recipientEmail)) {
    throw new Error("Recruiter email is invalid. Check the application email in the parsed details before sending.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const attachment = await getResumeAsset();
  const boundary = "job-assistant-boundary";

  const rawMessage = attachment
    ? [
        `From: ${senderEmail}`,
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/mixed; boundary=${boundary}`,
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        input.body,
        "",
        `--${boundary}`,
        `Content-Type: application/pdf; name="${attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        "",
        attachment.buffer.toString("base64"),
        "",
        `--${boundary}--`,
      ].join("\n")
    : [
        `From: ${senderEmail}`,
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        input.body,
      ].join("\n");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeMessage(rawMessage),
    },
  });
}
