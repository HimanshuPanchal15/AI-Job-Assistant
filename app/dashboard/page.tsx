"use client";

import { AdminGate } from "@/components/AdminGate";
import { ApplicationList } from "@/components/ApplicationList";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pt-4 sm:pt-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Tracker</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Applications Dashboard</h1>
        <p className="mt-3 text-slate-600">
          See every submitted application stored in Supabase, including recruiter email, batch, CTC, and location.
        </p>
      </div>
      <AdminGate
        storageKey="ai-job-assistant-admin-token"
        title="Owner Dashboard Access"
        description="Enter your private owner token to load application history from the protected API."
      >
        {(adminToken) => <ApplicationList adminToken={adminToken} />}
      </AdminGate>
    </div>
  );
}
