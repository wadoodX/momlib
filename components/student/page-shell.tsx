import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  children: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-50">
      <section className="mx-auto max-w-5xl">
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-3 text-stone-300">
            <Link href="/dashboard" className="hover:text-emerald-300">
              Dashboard
            </Link>
            <span className="text-stone-700">/</span>
            <Link href="/courses" className="hover:text-emerald-300">
              Courses
            </Link>
            <span className="text-stone-700">/</span>
            <Link href="/search" className="hover:text-emerald-300">
              Search
            </Link>
          </div>
          <SignOutButton className="rounded-full border border-stone-700 px-4 py-2 text-stone-200 hover:border-stone-500" />
        </nav>

        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300">{description}</p> : null}

        <div className="mt-10">{children}</div>
      </section>
    </main>
  );
}
