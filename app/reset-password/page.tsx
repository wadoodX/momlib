import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PasswordField } from "@/components/auth/password-field";
import { updateRecoveryPassword } from "./actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
      <section className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-2xl shadow-ink/10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Nibras</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Set a new password</h1>

        {message ? (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">{message}</div>
        ) : null}

        {user ? (
          <form action={updateRecoveryPassword} className="mt-8 space-y-5">
            <PasswordField
              name="password"
              label="New password"
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
              Update password
            </button>
          </form>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/login?mode=reset"
              className="mt-6 inline-flex rounded-2xl bg-sage px-5 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
            >
              Request a new link
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
