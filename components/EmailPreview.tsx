"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { sendApplication } from "@/lib/api";
import { PreviewState } from "@/lib/types";

export function EmailPreview() {
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = window.sessionStorage.getItem("application-preview");
    if (!saved) {
      router.replace("/");
      return;
    }

    setPreview(JSON.parse(saved) as PreviewState);
  }, [router]);

  function updateField(field: "subject" | "body", value: string) {
    setPreview((current) => {
      if (!current) {
        return current;
      }

      const next = { ...current, [field]: value };
      window.sessionStorage.setItem("application-preview", JSON.stringify(next));
      return next;
    });
  }

  function handleSend() {
    if (!preview) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await sendApplication(preview);
        window.sessionStorage.removeItem("application-preview");
        router.push("/dashboard");
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : "Unable to send application.");
      }
    });
  }

  if (!preview) {
    return <div className="panel p-8 text-sm text-slate-600">Loading preview...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="panel p-5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">Preview</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Review and edit your application email</h1>

        {preview.warning ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {preview.warning}
          </div>
        ) : null}

        <div className="mt-5">
          <label htmlFor="subject" className="label">
            Subject
          </label>
          <input
            id="subject"
            className="input"
            value={preview.subject}
            onChange={(event) => updateField("subject", event.target.value)}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="body" className="label">
            Email Body
          </label>
          <textarea
            id="body"
            className="input min-h-[320px] resize-y"
            value={preview.body}
            onChange={(event) => updateField("body", event.target.value)}
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="button-primary" onClick={handleSend} disabled={isPending}>
            {isPending ? "Sending..." : "Send Application"}
          </button>
          <button type="button" className="button-secondary" onClick={() => router.push("/")}>
            Edit Prompt
          </button>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">Parsed Details</p>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-ink">Company</p>
              <p>{preview.parsed.company}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Role</p>
              <p>{preview.parsed.role}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Batch</p>
              <p>{preview.parsed.batch}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">CTC</p>
              <p>{preview.parsed.ctc}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Location</p>
              <p>{preview.parsed.location}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Recruiter Email</p>
              <p className="break-all">{preview.parsed.email}</p>
            </div>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">Resume Match</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-display text-5xl text-ink">{preview.analysis?.match_score ?? 0}</span>
            <span className="pb-2 text-sm text-slate-500">/100</span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Key Required Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(preview.analysis?.key_required_skills ?? []).map((skill) => (
                <span key={skill} className="rounded-full bg-sky px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Suggested Resume Improvements</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(preview.analysis?.suggested_resume_improvements ?? []).map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
