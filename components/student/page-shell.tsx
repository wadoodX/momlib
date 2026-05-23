import { NavBar } from "@/components/layout/nav-bar";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { ThemeSync } from "@/components/theme-sync";
import { NodeIcon } from "@/components/customization/node-icon";
import { requireUser } from "@/lib/auth/guards";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  role?: "admin" | "student";
  breadcrumbs?: BreadcrumbItem[];
  icon?: string | null;
  color?: string | null;
  iconKind?: "course" | "subject";
  children: React.ReactNode;
};

export async function PageShell({
  eyebrow,
  title,
  description,
  role = "student",
  breadcrumbs,
  icon,
  color,
  iconKind,
  children,
}: PageShellProps) {
  const { user, profile } = await requireUser();

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      {profile ? <ThemeSync initialTheme={profile.theme} /> : null}
      <section className="mx-auto max-w-5xl">
        <NavBar role={profile?.role ?? role} displayName={profile?.full_name ?? null} email={user.email ?? ""} />

        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}

        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        <div className="mt-3 flex items-center gap-4">
          {iconKind ? <NodeIcon icon={icon} color={color} kind={iconKind} size="lg" /> : null}
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        </div>
        {description ? <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p> : null}

        <div className="mt-10">{children}</div>
      </section>
    </main>
  );
}
