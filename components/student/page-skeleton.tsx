/**
 * Static, data-free skeleton shown via each signed-in route's `loading.tsx`
 * while the server renders the real page. It mirrors `PageShell`'s chrome (outer
 * <main>/<section> wrappers + nav row + eyebrow/title) so navigation shows an
 * instant, on-theme placeholder instead of a frozen UI. The real NavBar needs
 * user data we don't have here, so the nav is a lightweight placeholder bar.
 *
 * `variant` shapes the body: "grid" (card lists like Courses/Dashboard),
 * "detail" (a chapter/resource page), or "form" (Settings, centered column).
 */
type SkeletonVariant = "grid" | "detail" | "form";

function Bar({ className }: { className?: string }) {
  return <div className={`rounded bg-line/50 ${className ?? ""}`} />;
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex h-56 flex-col rounded-3xl border border-line bg-card p-6">
          <div className="size-12 rounded-2xl bg-line/50" />
          <Bar className="mt-5 h-5 w-3/4" />
          <Bar className="mt-3 h-3 w-10" />
          <Bar className="mt-4 h-3 w-2/3" />
          <Bar className="mt-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5">
          <div className="size-10 rounded-xl bg-line/50" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-1/3" />
            <Bar className="h-3 w-1/4" />
          </div>
          <Bar className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ variant = "grid" }: { variant?: SkeletonVariant }) {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink lg:px-10 xl:px-12 2xl:px-16">
      <section className={variant === "form" ? "mx-auto w-full max-w-3xl" : "w-full"}>
        {/* Nav placeholder — mirrors NavBar (flex row on phones, 3-col grid on sm+;
            with a mobile-only links row). No pulse: it reads as chrome. */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-3">
            <Bar className="h-4 w-20 sm:justify-self-start" />
            <div className="hidden justify-center gap-6 sm:flex">
              <Bar className="h-4 w-16" />
              <Bar className="h-4 w-16" />
              <Bar className="h-4 w-16" />
            </div>
            <div className="size-9 rounded-full bg-line/50 sm:justify-self-end" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
          </div>
        </div>

        {/* Eyebrow + title + description, then the variant body — all gently pulsing. */}
        <div className="animate-pulse">
          <Bar className="h-3 w-28" />
          <Bar className="mt-4 h-10 w-2/3 max-w-md rounded-lg" />
          <Bar className="mt-5 h-4 w-1/2 max-w-sm" />
          <div className="mt-10">
            {variant === "grid" ? <SkeletonGrid /> : variant === "detail" ? <SkeletonDetail /> : <SkeletonForm />}
          </div>
        </div>
      </section>
    </main>
  );
}
