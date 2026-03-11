# AI Job Application Assistant

## Project Overview

AI Job Application Assistant is a Vercel-ready full-stack Next.js application that helps users turn a single structured job prompt into a tailored application email, preview and edit the draft, analyze resume fit, send the application with Gmail, and track submissions in Supabase.

## Architecture

- Frontend and backend are both implemented in Next.js App Router
- API routes under `app/api/*` handle parsing, AI generation, resume analysis, sending, and persistence
- Supabase PostgreSQL stores application records
- Hugging Face Inference API powers email generation with `mistralai/Mistral-7B-Instruct-v0.2`
- Gmail API sends the final email with a resume PDF attachment

Detailed architecture notes are available in [docs/architecture.md](docs/architecture.md).

## Input Format

Paste job details into a single textarea using this structure:

```text
Stripe
Backend Engineer
Batch: 2025
CTC: 25 LPA
Location: Bangalore

Job Description:
We are looking for engineers with strong Python and distributed systems experience.

jobs@stripe.com
```

The parser extracts:

- `company`
- `role`
- `batch`
- `ctc`
- `location`
- `job_description`
- `email`

## Local Development

1. Clone the repository and create `.env` from [.env.example](.env.example)
2. Provide a private resume PDF using `RESUME_BASE64` or by pointing `RESUME_FILE_PATH` to a local private PDF
3. Create a Supabase project and run [database/schema.sql](database/schema.sql)
4. Set `APP_ADMIN_TOKEN` in `.env`. This private token is required to send applications and open the dashboard.
4. Install dependencies:

```bash
npm install
```

5. Start the app:

```bash
npm run dev
```

6. Build locally before deploying:

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push the repository to GitHub
2. Import the project into Vercel
3. Set all required environment variables in the Vercel dashboard
4. Deploy

No standalone backend service is required.

## Supabase Setup

1. Create a new Supabase project
2. Run [database/schema.sql](database/schema.sql) in the SQL editor
3. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into `.env`
4. Keep RLS enabled. The application reads and writes through protected server routes using the service role key.

Stored application fields:

- `id`
- `company`
- `role`
- `recruiter_email`
- `batch`
- `ctc`
- `location`
- `date_applied`
- `status`

## Hugging Face API Setup

1. Create a Hugging Face account
2. Generate an inference API token
3. Set `HF_API_KEY` in `.env`

If the key is missing or the request fails, the app falls back to a deterministic default email template.

## Gmail API Setup

1. Create a Google Cloud project
2. Enable the Gmail API
3. Create OAuth credentials
4. Generate a refresh token for the sending Gmail account
5. Set:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - `GMAIL_SENDER_EMAIL`

The send route will attach the configured resume PDF automatically.
For deployment, prefer `RESUME_BASE64` so the resume is not committed to Git or exposed under `public/`.

## Security Notes

- `APP_ADMIN_TOKEN` protects the send and dashboard APIs from public access
- Supabase access now uses the server-only `SUPABASE_SERVICE_ROLE_KEY`
- The `applications` table keeps RLS enabled and no longer exposes public read/insert policies

## Continuous Integration

GitHub Actions is configured in [.github/workflows/ci.yml](.github/workflows/ci.yml) to install dependencies, lint the Next.js project, and verify the production build.
