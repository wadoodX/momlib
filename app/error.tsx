"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Something went wrong</p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">
        We hit a snag loading this page.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted">
        Please try again. If it keeps happening, sign out and back in, or come back in a moment.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
