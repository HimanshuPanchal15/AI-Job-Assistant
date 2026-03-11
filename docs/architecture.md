# Architecture Overview

## Summary

AI Job Application Assistant now runs as a single full-stack Next.js application:

- Next.js App Router handles both UI and server-side API routes.
- Vercel hosts the application as a deployable serverless app.
- Supabase stores submitted applications in PostgreSQL.
- Hugging Face Inference API generates tailored application email drafts.
- Gmail API sends the final edited email with a resume attachment.

## High-Level Flow

1. The user pastes one structured prompt into the home page textarea.
2. `POST /api/generate-email` parses the prompt deterministically with `lib/parsePrompt.ts`.
3. The route sends the parsed job details to Hugging Face to generate a professional email draft.
4. The frontend stores the parsed draft locally for preview and editing.
5. `POST /api/resume-analysis` compares the parsed job description with the bundled resume PDF.
6. The user edits the email and clicks send.
7. `POST /api/send-application` sends the email via Gmail API and stores the application in Supabase.
8. `GET /api/applications` powers the dashboard page.

## Key Modules

- `app/api/generate-email/route.ts`: parse prompt and generate email draft
- `app/api/send-application/route.ts`: send Gmail message and persist record
- `app/api/resume-analysis/route.ts`: analyze resume against parsed job description
- `app/api/applications/route.ts`: fetch application history
- `lib/parsePrompt.ts`: deterministic prompt parser
- `lib/huggingface.ts`: Hugging Face Inference API helper
- `lib/gmail.ts`: Gmail OAuth sending helper
- `lib/supabase.ts`: Supabase client and application persistence helpers

## Data Model

`applications`

- `id`
- `company`
- `role`
- `recruiter_email`
- `batch`
- `ctc`
- `location`
- `date_applied`
- `status`

## Deployment Notes

- The app is designed to build and run directly on Vercel with `npm install`, `npm run build`, and `npm start`
- Supabase must be configured with the schema in `database/schema.sql`
- Gmail OAuth secrets and the Hugging Face API key must be configured in Vercel environment variables
- Sensitive routes use `APP_ADMIN_TOKEN` and server-only Supabase access through `SUPABASE_SERVICE_ROLE_KEY`
