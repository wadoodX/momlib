import Link from "next/link";
import { signIn, signUp } from "./actions";
import { PasswordField } from "@/components/auth/password-field";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    next?: string;
    mode?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-paper-soft px-4 py-3 text-ink outline-none transition focus:border-sage";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isSignup = params.mode === "signup";
  const next = params.next ?? "/dashboard";
  const nextParam = params.next ? `&next=${encodeURIComponent(params.next)}` : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
      <section className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-2xl shadow-ink/10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Nibras</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isSignup
            ? "Sign up to start organizing your Islamic studies notes."
            : "Sign in to your account to access the portal."}
        </p>

        {params.message ? (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
            {params.message}
          </div>
        ) : null}

        {isSignup ? (
          <form action={signUp} className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="text-sm font-medium text-ink">Full name</span>
              <input name="full_name" type="text" autoComplete="name" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input required name="email" type="email" autoComplete="email" className={inputClass} />
            </label>
            <PasswordField
              name="password"
              label="Password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
            <PasswordField
              name="confirm_password"
              label="Confirm password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
            >
              Create account
            </button>
          </form>
        ) : (
          <form action={signIn} className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input required name="email" type="email" autoComplete="email" className={inputClass} />
            </label>
            <PasswordField name="password" label="Password" autoComplete="current-password" required />
            <button
              type="submit"
              className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
            >
              Sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-sage hover:text-sage-deep">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href={`/login?mode=signup${nextParam}`} className="font-semibold text-sage hover:text-sage-deep">
                Create an account
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
