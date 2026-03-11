import { JobPromptInput } from "@/components/JobPromptInput";

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
      <section className="pt-4 sm:pt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ember">Cloud-ready workflow</p>
        <h1 className="mt-4 max-w-xl font-display text-5xl leading-tight text-ink sm:text-6xl">
          Paste one job prompt and turn it into a ready-to-send application.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
          This version runs as a single Next.js full-stack app on Vercel, parses structured job details
          deterministically, generates an application email, and stores your activity in Supabase.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">1</p>
            <p className="mt-2 font-semibold text-ink">Paste job details into one textarea</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">2</p>
            <p className="mt-2 font-semibold text-ink">Review the parsed details and email draft</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">3</p>
            <p className="mt-2 font-semibold text-ink">Send and track applications from any device</p>
          </div>
        </div>
      </section>

      <section className="lg:pt-2">
        <JobPromptInput />
      </section>
    </div>
  );
}
