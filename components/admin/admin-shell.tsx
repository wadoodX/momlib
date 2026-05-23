import { NavBar } from "@/components/layout/nav-bar";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { ThemeSync } from "@/components/theme-sync";
import { requireUser } from "@/lib/auth/guards";

type AdminShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
};

export async function AdminShell({ eyebrow, title, description, breadcrumbs, children }: AdminShellProps) {
  const { user, profile } = await requireUser();

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      {profile ? <ThemeSync initialTheme={profile.theme} /> : null}
      <section className="mx-auto max-w-6xl">
        <NavBar role="admin" displayName={profile?.full_name ?? null} email={user.email ?? ""} />

        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}

        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{description}</p> : null}

        <div className="mt-10">{children}</div>
      </section>
    </main>
  );
}
