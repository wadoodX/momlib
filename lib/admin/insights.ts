// Pure dashboard-insight helpers (no supabase imports) so they can be
// unit-tested directly — see lib/__tests__/insights.test.ts. Consumed by the
// teacher dashboard's data layer in lib/db/admin-content.ts.

export type DayPoint = { day: string /* YYYY-MM-DD (UTC) */; views: number };

const DAY_MS = 86_400_000;

/** Zero-fill a sparse day-count series to exactly `days` UTC dates ending today.
 *  The DB buckets by `viewed_at::date` in UTC, so we generate UTC dates too. */
export function fillMissingDays(rows: DayPoint[], days: number, today: Date = new Date()): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, r.views]));
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(end - i * DAY_MS).toISOString().slice(0, 10);
    out.push({ day, views: byDay.get(day) ?? 0 });
  }
  return out;
}

export type GapKind = "blocked-publish" | "empty-chapter" | "childless-subject" | "draft-course";
export type GapNodeKind = "course" | "subject" | "chapter";

export type ContentGap = {
  kind: GapKind;
  nodeKind: GapNodeKind;
  id: string;
  title: string;
  /** Ancestor path, e.g. "Course / Subject" ("" for course-level gaps). */
  trail: string;
  /** Deep link that selects the node in the admin studio. */
  href: string;
  /** "publish" → the fix is publishing this (draft) node; "open" → needs content work. */
  action: "publish" | "open";
};

// Structural subsets of the getAdminTree() node types — CourseNode[] satisfies
// this shape, while tests can use minimal fixtures.
type GapNode = { id: string; title: string; is_published: boolean };
type GapSubject = GapNode & { chapters: GapNode[] };
type GapCourse = GapNode & { subjects: GapSubject[] };
type GapResource = { chapter_id: string; is_published: boolean };

const studioHref = (kind: GapNodeKind, id: string) => `/admin?${kind}=${id}`;

/**
 * Derive the "needs attention" queue from the admin tree + resource rows.
 *
 * - blocked-publish: a published node sits under a draft ancestor, so students
 *   can't see it. The gap targets the TOPMOST draft ancestor (publishing it is
 *   the unblocking step; any next-level drafts surface on the re-render),
 *   deduped to one gap per ancestor. A blocking course is NOT also reported
 *   as draft-course.
 * - empty-chapter: published chapter with no resources at all (a chapter whose
 *   resources are still drafts is being worked on, not empty).
 * - childless-subject: subject with no chapters (any publish state).
 * - draft-course: unpublished course (invisible to students).
 *
 * Returned in severity order: blocked → empty → childless → draft.
 */
export function detectContentGaps(courses: GapCourse[], resources: GapResource[]): ContentGap[] {
  const publishedResourceChapters = new Set<string>();
  const anyResourceChapters = new Set<string>();
  for (const r of resources) {
    anyResourceChapters.add(r.chapter_id);
    if (r.is_published) publishedResourceChapters.add(r.chapter_id);
  }

  const blocked: ContentGap[] = [];
  const blockedTargetIds = new Set<string>();
  const empty: ContentGap[] = [];
  const childless: ContentGap[] = [];
  const drafts: ContentGap[] = [];

  const addBlocked = (nodeKind: GapNodeKind, node: GapNode, trail: string) => {
    if (blockedTargetIds.has(node.id)) return;
    blockedTargetIds.add(node.id);
    blocked.push({
      kind: "blocked-publish",
      nodeKind,
      id: node.id,
      title: node.title,
      trail,
      href: studioHref(nodeKind, node.id),
      action: "publish",
    });
  };

  for (const course of courses) {
    for (const subject of course.subjects) {
      if (subject.chapters.length === 0) {
        childless.push({
          kind: "childless-subject",
          nodeKind: "subject",
          id: subject.id,
          title: subject.title,
          trail: course.title,
          href: studioHref("subject", subject.id),
          action: "open",
        });
      }

      // Published subject trapped under a draft course.
      if (subject.is_published && !course.is_published) {
        addBlocked("course", course, "");
      }

      for (const chapter of subject.chapters) {
        const chainPublished = course.is_published && subject.is_published;

        if (chapter.is_published && !chainPublished) {
          // Published chapter under a draft ancestor → target the topmost draft.
          if (!course.is_published) addBlocked("course", course, "");
          else addBlocked("subject", subject, course.title);
        }

        if (publishedResourceChapters.has(chapter.id) && !chapter.is_published) {
          // Published resource trapped under a draft chapter (or deeper draft).
          if (!course.is_published) addBlocked("course", course, "");
          else if (!subject.is_published) addBlocked("subject", subject, course.title);
          else addBlocked("chapter", chapter, `${course.title} / ${subject.title}`);
        }

        if (chapter.is_published && !anyResourceChapters.has(chapter.id)) {
          empty.push({
            kind: "empty-chapter",
            nodeKind: "chapter",
            id: chapter.id,
            title: chapter.title,
            trail: `${course.title} / ${subject.title}`,
            href: studioHref("chapter", chapter.id),
            action: "open",
          });
        }
      }
    }

    if (!course.is_published && !blockedTargetIds.has(course.id)) {
      drafts.push({
        kind: "draft-course",
        nodeKind: "course",
        id: course.id,
        title: course.title,
        trail: "",
        href: studioHref("course", course.id),
        action: "publish",
      });
    }
  }

  return [...blocked, ...empty, ...childless, ...drafts];
}
