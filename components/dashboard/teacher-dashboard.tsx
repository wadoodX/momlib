import { Link } from "next-view-transitions";
import {
  BookOpen,
  Layers,
  FolderTree,
  FileText,
  Presentation,
  FileType,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Eye,
  Users,
  TrendingUp,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  getAdminStats,
  getDraftCourses,
  getEngagementSummary,
  getRecentResourcesForAdmin,
  getResourceTypeBreakdown,
  getTopViewedChapters,
  type ResourceType,
} from "@/lib/db/admin-content";
import { timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/student/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/landing/reveal";

const TYPE_META: Record<ResourceType, { label: string; icon: LucideIcon }> = {
  pdf: { label: "PDFs", icon: FileText },
  ppt: { label: "Slides", icon: Presentation },
  doc: { label: "Docs", icon: FileType },
  image: { label: "Images", icon: ImageIcon },
  link: { label: "Links", icon: LinkIcon },
  video: { label: "Videos", icon: Video },
};

export async function TeacherDashboard() {
  const [stats, recent, drafts, summary, topChapters, typeBreakdown] = await Promise.all([
    getAdminStats(),
    getRecentResourcesForAdmin(),
    getDraftCourses(),
    getEngagementSummary(),
    getTopViewedChapters(),
    getResourceTypeBreakdown(),
  ]);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Courses"
            value={stats.courses.total}
            hint={`${stats.courses.published} published · ${stats.courses.draft} draft`}
            icon={BookOpen}
          />
          <StatCard
            label="Subjects"
            value={stats.subjects.total}
            hint={`${stats.subjects.published} published · ${stats.subjects.draft} draft`}
            icon={FolderTree}
          />
          <StatCard
            label="Chapters"
            value={stats.chapters.total}
            hint={`${stats.chapters.published} published · ${stats.chapters.draft} draft`}
            icon={Layers}
          />
          <StatCard
            label="Resources"
            value={stats.resources.total}
            hint={`${stats.resources.published} published · ${stats.resources.draft} draft`}
            icon={FileText}
          />
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-2xl bg-sage px-5 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
          >
            Manage content
          </Link>
          <Link
            href="/courses"
            className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
          >
            View as student
          </Link>
        </div>
      </Reveal>

      {/* Engagement */}
      <Reveal delay={0.1}>
        <section>
          <h2 className="text-xl font-semibold text-ink">Engagement</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total chapter views" value={summary.totalViews} icon={Eye} />
            <StatCard label="Learners" value={summary.learners} icon={Users} />
            <StatCard label="Views this week" value={summary.views7d} icon={TrendingUp} />
          </div>

          <div className="mt-4">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted">Most viewed chapters</h3>
            {topChapters.length === 0 ? (
              <EmptyState
                title="No views yet"
                description="Once students start opening chapters, your most popular ones will appear here."
              />
            ) : (
              <ol className="space-y-3">
                {topChapters.map((chapter, i) => (
                  <li key={chapter.chapterId}>
                    <Link
                      href={chapter.href}
                      className="flex items-center gap-4 rounded-3xl border border-line bg-card p-5 transition hover:border-sage"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs uppercase tracking-[0.2em] text-muted">{chapter.trail}</p>
                        <h4 className="mt-1 truncate text-base font-semibold text-ink">{chapter.title}</h4>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold text-ink">{chapter.viewCount}</p>
                        <p className="text-xs text-muted">
                          {chapter.learnerCount} {chapter.learnerCount === 1 ? "learner" : "learners"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </Reveal>

      {/* Recently added resources */}
      <Reveal delay={0.15}>
        <section>
          <h2 className="text-xl font-semibold text-ink">Recently added resources</h2>

          {/* resource-type breakdown strip */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {(Object.keys(TYPE_META) as ResourceType[]).map((type) => {
              const { label, icon: Icon } = TYPE_META[type];
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 text-xs text-muted"
                >
                  <Icon className="size-3.5 text-sage" />
                  <span className="font-semibold text-ink">{typeBreakdown[type]}</span>
                  {label}
                </span>
              );
            })}
          </div>

          <div className="mt-4">
            {recent.length === 0 ? (
              <EmptyState title="No resources yet" description="Resources you upload or link will appear here." />
            ) : (
              <div className="space-y-3">
                {recent.map((resource) => (
                  <Link
                    key={resource.id}
                    href={resource.href}
                    className="block rounded-3xl border border-line bg-card p-5 transition hover:border-sage"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-ink">{resource.title}</h3>
                      <span className={resource.isPublished ? "text-sm text-gold" : "text-sm text-muted"}>
                        {resource.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{resource.trail}</p>
                    <p className="mt-1 text-xs text-muted">Edited {timeAgo(resource.updatedAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* Drafts to finish */}
      <Reveal delay={0.2}>
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Drafts to finish</h2>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-gold"
            >
              All content
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-4">
            {drafts.length === 0 ? (
              <EmptyState title="No drafts" description="Unpublished courses will show here so you can finish and publish them." />
            ) : (
              <div className="space-y-3">
                {drafts.map((course) => (
                  <Link
                    key={course.id}
                    href={`/admin?course=${course.id}`}
                    className="block rounded-3xl border border-dashed border-line bg-paper-soft p-5 transition hover:border-sage"
                  >
                    <h3 className="text-lg font-semibold text-ink">{course.title}</h3>
                    <p className="mt-2 text-sm text-muted">/{course.slug}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
