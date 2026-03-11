import { ApplicationRecord, GeneratedEmailResponse, PreviewState, ResumeAnalysisResponse } from "@/lib/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data as { error?: string } | null)?.error || "Request failed");
  }

  return data as T;
}

export function generateEmail(prompt: string) {
  return request<GeneratedEmailResponse>("/api/generate-email", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export function analyzeResume(prompt: string) {
  return request<ResumeAnalysisResponse>("/api/resume-analysis", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export function sendApplication(payload: PreviewState) {
  return request<ApplicationRecord>("/api/send-application", {
    method: "POST",
    headers: {
      "x-admin-token": payload.adminToken ?? "",
    },
    body: JSON.stringify({
      parsed: payload.parsed,
      subject: payload.subject,
      body: payload.body,
    }),
  });
}

export function fetchApplications(adminToken: string) {
  return request<ApplicationRecord[]>("/api/applications", {
    headers: {
      "x-admin-token": adminToken,
    },
  });
}
