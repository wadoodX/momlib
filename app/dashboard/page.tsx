import { requireUser } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-12 text-stone-50">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300">Student area</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-10 rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
          <p className="text-sm text-stone-400">Signed in as</p>
          <p className="mt-2 text-lg font-medium">{user.email}</p>
          <p className="mt-4 text-sm text-stone-300">Role: {profile?.role ?? "student"}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/courses" className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-emerald-300/70">
            <h2 className="text-xl font-semibold">Browse courses</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">View published courses, subjects, chapters, and resources.</p>
          </Link>
          <Link href="/search" className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-emerald-300/70">
            <h2 className="text-xl font-semibold">Search resources</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">Find published notes by title, description, or file name.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
