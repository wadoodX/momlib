import Link from "next/link";
import { signIn, signUp, requestPasswordReset } from "./actions";
import { PasswordField } from "@/components/auth/password-field";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    next?: string;
    mode?: string;
  }>;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-paper-soft px-4 py-3 text-ink outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage";

const HEADINGS = {
  signin: { title: "Sign in", subtitle: "Sign in to your account to access the portal." },
  signup: { title: "Create your account", subtitle: "Sign up to start organizing your Islamic studies notes." },
  reset: { title: "Reset your password", subtitle: "Enter your email and we'll send you a reset link." },
} as const;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const mode: "signin" | "signup" | "reset" =
    params.mode === "signup" ? "signup" : params.mode === "reset" ? "reset" : "signin";
  const next = params.next ?? "/dashboard";
  const nextParam = params.next ? `&next=${encodeURIComponent(params.next)}` : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
      <section className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-2xl shadow-ink/10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Nibras</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{HEADINGS[mode].title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{HEADINGS[mode].subtitle}</p>

        {params.message ? (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
            {params.message}
          </div>
        ) : null}

        {mode === "signup" ? (
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
            <PasswordField name="confirm_password" label="Confirm password" autoComplete="new-password" required minLength={8} />
            <button
              type="submit"
              className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Create account
            </button>
          </form>
        ) : mode === "reset" ? (
          <form action={requestPasswordReset} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input required name="email" type="email" autoComplete="email" className={inputClass} />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Send reset link
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
            <div className="text-right">
              <Link href="/login?mode=reset" className="text-sm font-medium text-sage hover:text-sage-deep">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <Link href={`/login?mode=signup${nextParam}`} className="font-semibold text-sage hover:text-sage-deep">
                Create an account
              </Link>
            </>
          ) : (
            <>
              {mode === "signup" ? "Already have an account?" : "Remembered it?"}{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-sage hover:text-sage-deep">
                Sign in
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
