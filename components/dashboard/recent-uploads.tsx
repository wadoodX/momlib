import { Link } from "next-view-transitions";
import type { AdminRecentResource } from "@/lib/db/admin-content";
import { EmptyState } from "@/components/student/empty-state";
import { timeAgo } from "@/lib/format";

export function RecentUploads({ resources }: { resources: AdminRecentResource[] }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Recent activity</p>
      <h2 className="font-display mt-2 text-xl font-semibold text-ink">Latest resources</h2>

      {resources.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No resources yet"
            description="Files and links you add in the studio will show up here."
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {resources.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="lift-soft block rounded-2xl border border-line bg-paper p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-ink">{r.title}</p>
                  <span
                    className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                      r.isPublished ? "text-gold" : "text-muted"
                    }`}
                  >
                    {r.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] uppercase tracking-[0.2em] text-muted">{r.trail}</p>
                <p className="mt-1 text-xs text-muted">Edited {timeAgo(r.updatedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
