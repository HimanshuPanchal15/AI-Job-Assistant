CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    recruiter_email TEXT NOT NULL,
    batch TEXT NOT NULL,
    ctc TEXT NOT NULL,
    location TEXT NOT NULL,
    date_applied TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT applications_company_role_unique UNIQUE (company, role)
);

CREATE INDEX IF NOT EXISTS idx_applications_date_applied
    ON applications (date_applied DESC);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to applications" ON applications;
DROP POLICY IF EXISTS "Allow insert access to applications" ON applications;
