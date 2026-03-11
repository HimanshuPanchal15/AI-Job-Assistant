import type { Metadata } from "next";

import "@/app/globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AI Job Application Assistant",
  description: "A Vercel-ready Next.js app for parsing job prompts, generating tailored outreach, and tracking applications.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
