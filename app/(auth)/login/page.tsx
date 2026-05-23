import { signIn } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-stone-50">
      <section className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/80 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300">Momlib</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          Use your Supabase email and password account to access the portal.
        </p>

        {params.message ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {params.message}
          </div>
        ) : null}

        <form action={signIn} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <label className="block">
            <span className="text-sm font-medium text-stone-200">Email</span>
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none transition focus:border-emerald-300"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-200">Password</span>
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none transition focus:border-emerald-300"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
