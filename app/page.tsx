export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">
          Momlib
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          A student resource portal for organized Islamic Studies notes.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
          The foundation is ready for courses, subjects, chapters, resources, and Supabase-backed access control.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/login"
            className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200"
          >
            Sign in
          </a>
          <a
            href="/dashboard"
            className="rounded-full border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-500"
          >
            Student dashboard
          </a>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            "Course-wise organization",
            "Supabase-ready foundation",
            "Admin and student paths next",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 text-sm text-stone-200">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
