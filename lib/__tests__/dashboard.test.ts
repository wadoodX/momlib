import { describe, it, expect } from "vitest";
import {
  buildActivity,
  buildCourses,
  buildDashboard,
  buildNewlyAdded,
  buildProgress,
  buildRecent,
  buildResume,
  buildStartHere,
  type ChapterNode,
  type ViewRow,
} from "@/lib/dashboard";

// Fixture tree: Course A (order 0) → S1 (3 chapters), S2 (2 chapters); Course B (order 1) → S3 (1).
function node(
  id: string,
  orderIndex: number,
  createdAt: string,
  subject: { id: string; title: string; slug: string; order: number },
  course: { id: string; title: string; slug: string; order: number },
): ChapterNode {
  return {
    id,
    title: id.toUpperCase(),
    slug: id,
    orderIndex,
    createdAt,
    subjectId: subject.id,
    subjectTitle: subject.title,
    subjectSlug: subject.slug,
    subjectOrder: subject.order,
    subjectColor: "sage",
    subjectIcon: "BookOpen",
    courseId: course.id,
    courseTitle: course.title,
    courseSlug: course.slug,
    courseOrder: course.order,
    courseColor: "gold",
    courseIcon: "GraduationCap",
  };
}

const A = { id: "a", title: "Course A", slug: "a", order: 0 };
const B = { id: "b", title: "Course B", slug: "b", order: 1 };
const S1 = { id: "s1", title: "S1", slug: "s1", order: 0 };
const S2 = { id: "s2", title: "S2", slug: "s2", order: 1 };
const S3 = { id: "s3", title: "S3", slug: "s3", order: 0 };

const NODES: ChapterNode[] = [
  node("c1", 0, "2026-01-01T00:00:00.000Z", S1, A),
  node("c2", 1, "2026-01-02T00:00:00.000Z", S1, A),
  node("c3", 2, "2026-01-03T00:00:00.000Z", S1, A),
  node("c4", 0, "2026-01-04T00:00:00.000Z", S2, A),
  node("c5", 1, "2026-01-05T00:00:00.000Z", S2, A),
  node("c6", 0, "2026-01-06T00:00:00.000Z", S3, B),
];

const VIEWS: ViewRow[] = [
  { chapterId: "c1", viewedAt: "2026-07-01T09:00:00.000Z", completedAt: "2026-07-01T09:30:00.000Z" },
  { chapterId: "c2", viewedAt: "2026-07-03T09:00:00.000Z", completedAt: null },
  { chapterId: "c4", viewedAt: "2026-07-02T09:00:00.000Z", completedAt: "2026-07-02T10:00:00.000Z" },
];

const NOW = Date.parse("2026-07-03T12:00:00.000Z");

describe("buildRecent", () => {
  it("returns opened chapters newest-first, capped", () => {
    expect(buildRecent(NODES, VIEWS).map((r) => r.chapterId)).toEqual(["c2", "c4", "c1"]);
    expect(buildRecent(NODES, VIEWS, 2).map((r) => r.chapterId)).toEqual(["c2", "c4"]);
  });
  it("builds href + trail + inherited visuals", () => {
    const [top] = buildRecent(NODES, VIEWS, 1);
    expect(top.href).toBe("/courses/a/s1/c2");
    expect(top.trail).toBe("Course A / S1");
    expect(top.icon).toBe("BookOpen");
  });
});

describe("buildResume", () => {
  it("resumes the most recent chapter and points to the next uncompleted one in its subject", () => {
    const { current, upNext } = buildResume(NODES, VIEWS);
    expect(current?.chapterId).toBe("c2");
    expect(upNext).toEqual({ title: "C3", href: "/courses/a/s1/c3" });
  });
  it("is empty with no views", () => {
    expect(buildResume(NODES, [])).toEqual({ current: null, upNext: null });
  });
});

describe("buildProgress", () => {
  it("computes overall + per-engaged-subject completion", () => {
    const { overall, subjects } = buildProgress(NODES, VIEWS);
    expect(overall).toEqual({ completed: 2, total: 6, pct: 33 });
    // engaged: S1 (1/3) and S2 (1/2); sorted by pct desc → S2 first
    expect(subjects.map((s) => [s.subjectId, s.completed, s.total, s.pct])).toEqual([
      ["s2", 1, 2, 50],
      ["s1", 1, 3, 33],
    ]);
  });
  it("has no subject bars when nothing is viewed", () => {
    const { overall, subjects } = buildProgress(NODES, []);
    expect(overall).toEqual({ completed: 0, total: 6, pct: 0 });
    expect(subjects).toEqual([]);
  });
});

describe("buildCourses", () => {
  it("lists all courses in order with completion", () => {
    const courses = buildCourses(NODES, VIEWS);
    expect(courses.map((c) => [c.courseId, c.subjectCount, c.totalChapters, c.completed, c.pct])).toEqual([
      ["a", 2, 5, 2, 40],
      ["b", 1, 1, 0, 0],
    ]);
    expect(courses[0].href).toBe("/courses/a");
  });
});

describe("buildActivity", () => {
  it("counts active days across the last 7 (UTC) and reports last-opened", () => {
    const a = buildActivity(VIEWS, NOW);
    expect(a.days).toEqual([false, false, false, false, true, true, true]);
    expect(a.activeDaysLast7).toBe(3);
    expect(a.lastViewedAt).toBe("2026-07-03T09:00:00.000Z");
  });
  it("is all-zero with no views", () => {
    expect(buildActivity([], NOW)).toEqual({ activeDaysLast7: 0, days: [false, false, false, false, false, false, false], lastViewedAt: null });
  });
});

describe("buildNewlyAdded", () => {
  it("orders by createdAt desc", () => {
    expect(buildNewlyAdded(NODES).map((n) => n.chapterId)).toEqual(["c6", "c5", "c4", "c3"]);
  });
});

describe("buildStartHere", () => {
  it("returns the first chapters in course/subject/chapter order", () => {
    expect(buildStartHere(NODES).map((n) => n.chapterId)).toEqual(["c1", "c2", "c3"]);
  });
});

describe("buildDashboard", () => {
  it("assembles everything and flags activity", () => {
    const d = buildDashboard(NODES, VIEWS, NOW);
    expect(d.hasActivity).toBe(true);
    expect(d.resume.current?.chapterId).toBe("c2");
    expect(d.progress.overall.pct).toBe(33);
    expect(d.courses).toHaveLength(2);
    expect(d.recent).toHaveLength(3);
  });
  it("flags no activity for a fresh student but still lists courses + start-here", () => {
    const d = buildDashboard(NODES, [], NOW);
    expect(d.hasActivity).toBe(false);
    expect(d.resume.current).toBeNull();
    expect(d.courses).toHaveLength(2);
    expect(d.startHere.map((s) => s.chapterId)).toEqual(["c1", "c2", "c3"]);
  });
});
