/**
 * Pure builders for the student dashboard. Given the published chapter tree
 * (ChapterNode[]) and the current user's chapter_views (ViewRow[]), these compute
 * everything the dashboard renders — resume, recent, progress, per-course
 * progress, activity, newly-added, and start-here. No I/O and no `Date.now()`
 * inside (time is passed in), so they're deterministic and unit-testable.
 */

export type ChapterNode = {
  id: string;
  title: string;
  slug: string;
  orderIndex: number;
  createdAt: string;
  subjectId: string;
  subjectTitle: string;
  subjectSlug: string;
  subjectOrder: number;
  subjectColor: string | null;
  subjectIcon: string | null;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseOrder: number;
  courseColor: string | null;
  courseIcon: string | null;
};

export type ViewRow = {
  chapterId: string;
  viewedAt: string;
  completedAt: string | null;
};

export type ChapterRef = {
  chapterId: string;
  title: string;
  trail: string; // "Course / Subject"
  href: string;
  icon: string | null;
  color: string | null;
};

export type RecentChapter = ChapterRef & { viewedAt: string };
export type NewChapter = ChapterRef & { createdAt: string };

export type ResumeInfo = {
  current: RecentChapter | null;
  upNext: { title: string; href: string } | null;
};

export type OverallProgress = { completed: number; total: number; pct: number };

export type SubjectProgress = {
  subjectId: string;
  title: string;
  trail: string; // course title
  href: string; // subject page
  completed: number;
  total: number;
  pct: number;
  color: string | null;
  icon: string | null;
};

export type CourseProgress = {
  courseId: string;
  title: string;
  href: string;
  subjectCount: number;
  totalChapters: number;
  completed: number;
  pct: number;
  color: string | null;
  icon: string | null;
};

export type ActivitySummary = {
  activeDaysLast7: number;
  days: boolean[]; // length 7, oldest → newest (today is last)
  lastViewedAt: string | null;
};

export type DashboardData = {
  hasActivity: boolean;
  resume: ResumeInfo;
  recent: RecentChapter[];
  progress: { overall: OverallProgress; subjects: SubjectProgress[] };
  courses: CourseProgress[];
  activity: ActivitySummary;
  newlyAdded: NewChapter[];
  startHere: ChapterRef[];
};

const DAY_MS = 86_400_000;

const pct = (completed: number, total: number) => (total > 0 ? Math.round((completed / total) * 100) : 0);

const nodeHref = (n: ChapterNode) => `/courses/${n.courseSlug}/${n.subjectSlug}/${n.slug}`;
const nodeTrail = (n: ChapterNode) => `${n.courseTitle} / ${n.subjectTitle}`;

function chapterRef(n: ChapterNode): ChapterRef {
  return {
    chapterId: n.id,
    title: n.title,
    trail: nodeTrail(n),
    href: nodeHref(n),
    // Inherit visual identity from the subject, falling back to the course.
    icon: n.subjectIcon ?? n.courseIcon,
    color: n.subjectColor ?? n.courseColor,
  };
}

const completedIds = (nodes: ChapterNode[], views: ViewRow[]) => {
  const known = new Set(nodes.map((n) => n.id));
  return new Set(views.filter((v) => v.completedAt && known.has(v.chapterId)).map((v) => v.chapterId));
};

/** Recently opened chapters, newest first (ISO timestamps sort lexically). */
export function buildRecent(nodes: ChapterNode[], views: ViewRow[], limit = 6): RecentChapter[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return views
    .filter((v) => byId.has(v.chapterId))
    .slice()
    .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
    .slice(0, limit)
    .map((v) => ({ ...chapterRef(byId.get(v.chapterId)!), viewedAt: v.viewedAt }));
}

/** The most-recently-opened chapter + the next uncompleted chapter in its subject. */
export function buildResume(nodes: ChapterNode[], views: ViewRow[]): ResumeInfo {
  const current = buildRecent(nodes, views, 1)[0] ?? null;
  if (!current) return { current: null, upNext: null };

  const cur = nodes.find((n) => n.id === current.chapterId)!;
  const done = completedIds(nodes, views);
  const next = nodes
    .filter((n) => n.subjectId === cur.subjectId && n.orderIndex > cur.orderIndex && !done.has(n.id))
    .sort((a, b) => a.orderIndex - b.orderIndex)[0];

  return { current, upNext: next ? { title: next.title, href: nodeHref(next) } : null };
}

/** Overall completion + per-subject bars for subjects the student has engaged with. */
export function buildProgress(
  nodes: ChapterNode[],
  views: ViewRow[],
): { overall: OverallProgress; subjects: SubjectProgress[] } {
  const done = completedIds(nodes, views);
  const overall: OverallProgress = { completed: done.size, total: nodes.length, pct: pct(done.size, nodes.length) };

  const bySubject = new Map<string, ChapterNode[]>();
  for (const n of nodes) {
    const list = bySubject.get(n.subjectId);
    if (list) list.push(n);
    else bySubject.set(n.subjectId, [n]);
  }

  // Subjects the student has opened at least one chapter in.
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const engaged = new Set<string>();
  for (const v of views) {
    const node = byId.get(v.chapterId);
    if (node) engaged.add(node.subjectId);
  }

  const subjects: SubjectProgress[] = [];
  for (const subjectId of engaged) {
    const list = bySubject.get(subjectId)!;
    const first = list[0];
    const completed = list.filter((n) => done.has(n.id)).length;
    subjects.push({
      subjectId,
      title: first.subjectTitle,
      trail: first.courseTitle,
      href: `/courses/${first.courseSlug}/${first.subjectSlug}`,
      completed,
      total: list.length,
      pct: pct(completed, list.length),
      color: first.subjectColor ?? first.courseColor,
      icon: first.subjectIcon ?? first.courseIcon,
    });
  }
  subjects.sort((a, b) => b.pct - a.pct || a.title.localeCompare(b.title));
  return { overall, subjects };
}

/** All published courses with their explored/complete progress, in course order. */
export function buildCourses(nodes: ChapterNode[], views: ViewRow[]): CourseProgress[] {
  const done = completedIds(nodes, views);
  const byCourse = new Map<string, ChapterNode[]>();
  for (const n of nodes) {
    const list = byCourse.get(n.courseId);
    if (list) list.push(n);
    else byCourse.set(n.courseId, [n]);
  }

  return [...byCourse.values()]
    .sort((a, b) => a[0].courseOrder - b[0].courseOrder || a[0].courseTitle.localeCompare(b[0].courseTitle))
    .map((list) => {
      const first = list[0];
      const completed = list.filter((n) => done.has(n.id)).length;
      return {
        courseId: first.courseId,
        title: first.courseTitle,
        href: `/courses/${first.courseSlug}`,
        subjectCount: new Set(list.map((n) => n.subjectId)).size,
        totalChapters: list.length,
        completed,
        pct: pct(completed, list.length),
        color: first.courseColor,
        icon: first.courseIcon,
      };
    });
}

/** Approximate active-days over the last 7 calendar days (UTC), plus last-opened. */
export function buildActivity(views: ViewRow[], now: number): ActivitySummary {
  const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const viewedDays = new Set(views.map((v) => v.viewedAt.slice(0, 10)));

  const days: boolean[] = [];
  for (let i = 6; i >= 0; i--) days.push(viewedDays.has(dayKey(now - i * DAY_MS)));

  const lastViewedAt = views.reduce<string | null>((max, v) => (!max || v.viewedAt > max ? v.viewedAt : max), null);
  return { activeDaysLast7: days.filter(Boolean).length, days, lastViewedAt };
}

/** Most recently created chapters (for "Discover · newly added"). */
export function buildNewlyAdded(nodes: ChapterNode[], limit = 4): NewChapter[] {
  return [...nodes]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((n) => ({ ...chapterRef(n), createdAt: n.createdAt }));
}

/** The first chapters in course/subject/chapter order (empty-state "Start here"). */
export function buildStartHere(nodes: ChapterNode[], limit = 3): ChapterRef[] {
  return [...nodes]
    .sort((a, b) => a.courseOrder - b.courseOrder || a.subjectOrder - b.subjectOrder || a.orderIndex - b.orderIndex)
    .slice(0, limit)
    .map(chapterRef);
}

/** Assemble the full dashboard payload from the chapter tree + the user's views. */
export function buildDashboard(nodes: ChapterNode[], views: ViewRow[], now: number): DashboardData {
  return {
    hasActivity: views.length > 0,
    resume: buildResume(nodes, views),
    recent: buildRecent(nodes, views, 5),
    progress: buildProgress(nodes, views),
    courses: buildCourses(nodes, views),
    activity: buildActivity(views, now),
    newlyAdded: buildNewlyAdded(nodes, 4),
    startHere: buildStartHere(nodes, 3),
  };
}
