"use client";

import { FormEvent, useEffect, useState } from "react";

type AdminGateProps = {
  storageKey: string;
  title: string;
  description: string;
  children: (adminToken: string) => React.ReactNode;
};

export function AdminGate({ storageKey, title, description, children }: AdminGateProps) {
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);

  useEffect(() => {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) {
      setSavedToken(existing);
    }
  }, [storageKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      return;
    }

    window.localStorage.setItem(storageKey, trimmed);
    setSavedToken(trimmed);
  }

  if (savedToken) {
    return <>{children(savedToken)}</>;
  }

  return (
    <div className="panel max-w-xl p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">Protected Area</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="adminToken" className="label">
            Owner Access Token
          </label>
          <input
            id="adminToken"
            type="password"
            className="input"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Enter your private app token"
            required
          />
        </div>

        <button type="submit" className="button-primary">
          Continue
        </button>
      </form>
    </div>
  );
}
