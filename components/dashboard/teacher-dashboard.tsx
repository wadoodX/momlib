import { getTeacherDashboardData } from "@/lib/db/admin-content";
import { AttentionQueue } from "./attention-queue";
import { LibraryGlance } from "./library-glance";
import { EngagementPanel } from "./engagement-panel";
import { RecentUploads } from "./recent-uploads";
import { QuickAddCard } from "./quick-add-card";

/**
 * Mission Control — the teacher's bento command center, organized around three
 * questions: what needs me (queue, with inline publish) · are students engaging
 * (deep-teal panel: 14-day activity + most-read) · what's next (recent uploads,
 * quick-add). One parallel data fetch; cells stagger in via .card-rise.
 */
export async function TeacherDashboard() {
  const { stats, recent, summary, topChapters, typeBreakdown, viewsByDay, gaps } =
    await getTeacherDashboardData();

  const cells: { key: string; className: string; node: React.ReactNode }[] = [
    { key: "queue", className: "md:col-span-2 lg:col-span-7", node: <AttentionQueue gaps={gaps} /> },
    { key: "glance", className: "lg:col-span-5", node: <LibraryGlance stats={stats} typeBreakdown={typeBreakdown} /> },
    {
      key: "engagement",
      className: "md:col-span-2 lg:col-span-7 lg:row-span-2",
      node: <EngagementPanel summary={summary} days={viewsByDay} topChapters={topChapters} />,
    },
    { key: "recent", className: "lg:col-span-5", node: <RecentUploads resources={recent} /> },
    { key: "quick-add", className: "lg:col-span-5", node: <QuickAddCard /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
      {cells.map((cell, i) => (
        <div key={cell.key} className={`card-rise ${cell.className}`} style={{ animationDelay: `${i * 60}ms` }}>
          {cell.node}
        </div>
      ))}
    </div>
  );
}
