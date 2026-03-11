"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { analyzeResume, generateEmail } from "@/lib/api";
import { PreviewState } from "@/lib/types";

const PLACEHOLDER = `Stripe
Backend Engineer
Batch: 2025
CTC: 25 LPA
Location: Bangalore

Job Description:
Paste job description here

jobs@stripe.com`;

const ADMIN_TOKEN_STORAGE_KEY = "ai-job-assistant-admin-token";

export function JobPromptInput() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (existing) {
      setAdminToken(existing);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedToken = adminToken.trim();
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, trimmedToken);

      const [draft, analysis] = await Promise.all([generateEmail(prompt), analyzeResume(prompt)]);
      const previewState: PreviewState = {
        ...draft,
        rawPrompt: prompt,
        analysis,
        adminToken: trimmedToken,
      };

      window.sessionStorage.setItem("application-preview", JSON.stringify(previewState));
      router.push("/preview");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5 sm:p-8">
      <div className="mb-5">
        <label htmlFor="ownerToken" className="label">
          Owner Access Token
        </label>
        <input
          id="ownerToken"
          type="password"
          className="input"
          placeholder="Required once on this device for sending and dashboard access"
          value={adminToken}
          onChange={(event) => setAdminToken(event.target.value)}
          required
        />
        <p className="mt-2 text-xs text-slate-500">This token is remembered on this device after you enter it.</p>
      </div>

      <label htmlFor="jobPrompt" className="label">
        Paste Job Details
      </label>
      <textarea
        id="jobPrompt"
        className="input min-h-[360px] resize-y"
        placeholder={PLACEHOLDER}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        required
      />

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Paste one structured prompt to parse, generate, analyze, and send.</p>
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Generating..." : "Generate Application"}
        </button>
      </div>
    </form>
  );
}
