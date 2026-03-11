import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
      <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
        AI Job Application Assistant
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/" className="button-secondary !px-4 !py-2">
          Home
        </Link>
        <Link href="/dashboard" className="button-primary !px-4 !py-2">
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
