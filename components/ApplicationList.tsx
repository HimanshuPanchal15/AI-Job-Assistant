"use client";

import { useEffect, useState } from "react";

import { fetchApplications } from "@/lib/api";
import { ApplicationRecord } from "@/lib/types";

export function ApplicationList({ adminToken }: { adminToken: string }) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        setApplications(await fetchApplications(adminToken));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    }

    void loadApplications();
  }, [adminToken]);

  if (loading) {
    return <div className="panel p-6 text-sm text-slate-600">Loading applications...</div>;
  }

  if (error) {
    return <div className="panel p-6 text-sm text-red-700">{error}</div>;
  }

  if (!applications.length) {
    return <div className="panel p-6 text-sm text-slate-600">No applications have been sent yet.</div>;
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-4 font-semibold">Company</th>
              <th className="px-4 py-4 font-semibold">Role</th>
              <th className="px-4 py-4 font-semibold">Email</th>
              <th className="px-4 py-4 font-semibold">Batch</th>
              <th className="px-4 py-4 font-semibold">CTC</th>
              <th className="px-4 py-4 font-semibold">Location</th>
              <th className="px-4 py-4 font-semibold">Date Applied</th>
              <th className="px-4 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-medium text-ink">{application.company}</td>
                <td className="px-4 py-4">{application.role}</td>
                <td className="px-4 py-4 break-all">{application.recruiter_email}</td>
                <td className="px-4 py-4">{application.batch}</td>
                <td className="px-4 py-4">{application.ctc}</td>
                <td className="px-4 py-4">{application.location}</td>
                <td className="px-4 py-4">{new Date(application.date_applied).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-sky px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                    {application.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
