import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">404</p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">This page can&apos;t be found.</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted">
        The page may have moved, or you may not have access to it.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
