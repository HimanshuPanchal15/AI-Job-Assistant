Do not store your real resume in `public/` for production.

Use one of these private options instead:
- store the PDF in a private Supabase Storage bucket and set `SUPABASE_RESUME_BUCKET` + `SUPABASE_RESUME_PATH`
- set `RESUME_BASE64` in your environment variables for deployment
- place a local file at `private/resume.pdf`
- or point `RESUME_FILE_PATH` to another private PDF path
