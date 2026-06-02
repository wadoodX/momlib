import { requireUser } from "@/lib/auth/guards";
import { PageShell } from "@/components/student/page-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PasswordField } from "@/components/auth/password-field";
import { ThemeControl } from "@/components/settings/theme-control";
import { updatePassword, updateProfile } from "./actions";

type SettingsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "");
  return letters.toUpperCase() || source[0]?.toUpperCase() || "?";
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-paper-soft px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-sage focus-visible:ring-2 focus-visible:ring-sage";

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { user, profile } = await requireUser();
  const { message } = await searchParams;

  const role = profile?.role ?? "student";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <PageShell
      eyebrow="Account"
      title="Settings"
      description="Manage your profile, security, and how Nibras looks."
      role={role}
    >
      <div className="max-w-2xl space-y-8">
        {message ? (
          <div className="rounded-2xl border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-ink">
            {message}
          </div>
        ) : null}

        {/* Profile */}
        <section className="rounded-3xl border border-line bg-card p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-sage text-xl font-semibold text-paper">
              {initials(profile?.full_name ?? null, user.email ?? "")}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">Profile</h2>
              <p className="text-sm text-muted">This name appears across the portal.</p>
            </div>
          </div>

          <form action={updateProfile} className="mt-6">
            <label className="block">
              <span className="text-sm font-medium text-ink">Display name</span>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Your name"
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
            >
              Save profile
            </button>
          </form>
        </section>

        {/* Appearance */}
        <section className="rounded-3xl border border-line bg-card p-8">
          <h2 className="text-xl font-semibold text-ink">Appearance</h2>
          <p className="text-sm text-muted">
            Choose how Nibras looks. Your preference is saved to your account and follows you across
            devices.
          </p>
          <div className="mt-5">
            <ThemeControl />
          </div>
        </section>

        {/* Security */}
        <section className="rounded-3xl border border-line bg-card p-8">
          <h2 className="text-xl font-semibold text-ink">Security</h2>
          <p className="text-sm text-muted">Set a new password for your account.</p>
          <form action={updatePassword} className="mt-6 grid gap-4 sm:grid-cols-2">
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
              placeholder="Re-enter password"
            />
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
              >
                Update password
              </button>
            </div>
          </form>
        </section>

        {/* Account */}
        <section className="rounded-3xl border border-line bg-card p-8">
          <h2 className="text-xl font-semibold text-ink">Account</h2>
          <dl className="mt-5 divide-y divide-line">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="text-sm font-medium text-ink">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Role</dt>
              <dd>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold">
                  {role === "admin" ? "Teacher" : "Student"}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Member since</dt>
              <dd className="text-sm font-medium text-ink">{memberSince}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
