import {
  BookOpen,
  FileText,
  FileType,
  FolderTree,
  ImageIcon,
  Layers,
  LinkIcon,
  Presentation,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { AdminStats, ResourceType } from "@/lib/db/admin-content";
import { StatCard } from "./stat-card";

const TYPE_META: Record<ResourceType, { label: string; icon: LucideIcon }> = {
  pdf: { label: "PDFs", icon: FileText },
  ppt: { label: "Slides", icon: Presentation },
  doc: { label: "Docs", icon: FileType },
  image: { label: "Images", icon: ImageIcon },
  link: { label: "Links", icon: LinkIcon },
  video: { label: "Videos", icon: Video },
};

export function LibraryGlance({
  stats,
  typeBreakdown,
}: {
  stats: AdminStats;
  typeBreakdown: Record<ResourceType, number>;
}) {
  const hint = (b: { published: number; draft: number }) => `${b.published} published · ${b.draft} draft`;

  return (
    <section className="rounded-3xl border border-line bg-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">The library</p>
      <h2 className="font-display mt-2 text-xl font-semibold text-ink">At a glance</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Courses" value={stats.courses.total} hint={hint(stats.courses)} icon={BookOpen} />
        <StatCard label="Subjects" value={stats.subjects.total} hint={hint(stats.subjects)} icon={FolderTree} />
        <StatCard label="Chapters" value={stats.chapters.total} hint={hint(stats.chapters)} icon={Layers} />
        <StatCard label="Resources" value={stats.resources.total} hint={hint(stats.resources)} icon={FileText} />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
        {(Object.keys(TYPE_META) as ResourceType[]).map((type) => {
          const Icon = TYPE_META[type].icon;
          return (
            <span key={type} className="inline-flex items-center gap-1.5 text-sm text-muted">
              <Icon className="size-4 text-sage" aria-hidden />
              <strong className="font-semibold text-ink">{typeBreakdown[type]}</strong>
              {TYPE_META[type].label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
