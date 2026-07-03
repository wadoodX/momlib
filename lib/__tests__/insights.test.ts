import { describe, it, expect } from "vitest";
import { fillMissingDays, detectContentGaps, type DayPoint } from "@/lib/admin/insights";

// -- fixtures ----------------------------------------------------------------

const chapter = (id: string, published = true) => ({
  id,
  title: `Chapter ${id}`,
  is_published: published,
});

const subject = (id: string, published = true, chapters: ReturnType<typeof chapter>[] = [chapter(`${id}-ch`)]) => ({
  id,
  title: `Subject ${id}`,
  is_published: published,
  chapters,
});

const course = (id: string, published = true, subjects: ReturnType<typeof subject>[] = [subject(`${id}-s`)]) => ({
  id,
  title: `Course ${id}`,
  is_published: published,
  subjects,
});

const res = (chapterId: string, published = true) => ({ chapter_id: chapterId, is_published: published });

/** Resources covering every chapter in the tree, so no empty-chapter gaps fire. */
function coverAllChapters(courses: ReturnType<typeof course>[]) {
  return courses.flatMap((c) => c.subjects.flatMap((s) => s.chapters.map((ch) => res(ch.id))));
}

// -- fillMissingDays ----------------------------------------------------------

describe("fillMissingDays", () => {
  const today = new Date("2026-07-03T15:30:00Z");

  it("returns exactly `days` entries ending at today (UTC), zero-filled", () => {
    const out = fillMissingDays([], 14, today);
    expect(out).toHaveLength(14);
    expect(out[0]).toEqual({ day: "2026-06-20", views: 0 });
    expect(out[13]).toEqual({ day: "2026-07-03", views: 0 });
    expect(out.every((p) => p.views === 0)).toBe(true);
  });

  it("preserves counts on their days and fills the gaps", () => {
    const rows: DayPoint[] = [
      { day: "2026-07-01", views: 3 },
      { day: "2026-07-03", views: 1 },
    ];
    const out = fillMissingDays(rows, 7, today);
    expect(out).toHaveLength(7);
    expect(out.find((p) => p.day === "2026-07-01")).toEqual({ day: "2026-07-01", views: 3 });
    expect(out.find((p) => p.day === "2026-07-02")).toEqual({ day: "2026-07-02", views: 0 });
    expect(out.find((p) => p.day === "2026-07-03")).toEqual({ day: "2026-07-03", views: 1 });
  });

  it("ignores rows outside the window", () => {
    const rows: DayPoint[] = [{ day: "2026-01-01", views: 99 }];
    const out = fillMissingDays(rows, 7, today);
    expect(out).toHaveLength(7);
    expect(out.every((p) => p.views === 0)).toBe(true);
  });
});

// -- detectContentGaps ---------------------------------------------------------

describe("detectContentGaps", () => {
  it("returns [] for a healthy tree", () => {
    const tree = [course("a"), course("b")];
    expect(detectContentGaps(tree, coverAllChapters(tree))).toEqual([]);
  });

  it("flags a draft course with a publish action and studio deep link", () => {
    // All-draft chain: nothing published inside, so this is a plain draft, not "blocked".
    const tree = [course("a", false, [subject("a-s", false, [chapter("a-s-ch", false)])])];
    const gaps = detectContentGaps(tree, [res("a-s-ch", false)]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      kind: "draft-course",
      nodeKind: "course",
      id: "a",
      href: "/admin?course=a",
      action: "publish",
    });
  });

  it("flags a published chapter with zero resources as empty-chapter (open action)", () => {
    const tree = [course("a")]; // one chapter "a-s-ch", no resources supplied
    const gaps = detectContentGaps(tree, []);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      kind: "empty-chapter",
      nodeKind: "chapter",
      id: "a-s-ch",
      href: "/admin?chapter=a-s-ch",
      action: "open",
      trail: "Course a / Subject a-s",
    });
  });

  it("does NOT flag a draft chapter with zero resources as empty", () => {
    const tree = [course("a", true, [subject("a-s", true, [chapter("a-s-ch", false)])])];
    expect(detectContentGaps(tree, [])).toEqual([]);
  });

  it("does NOT flag a chapter whose only resources are drafts as empty", () => {
    const tree = [course("a")];
    expect(detectContentGaps(tree, [res("a-s-ch", false)])).toEqual([]);
  });

  it("flags a subject with no chapters as childless-subject", () => {
    const tree = [course("a", true, [subject("a-s", true, [])])];
    const gaps = detectContentGaps(tree, []);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      kind: "childless-subject",
      nodeKind: "subject",
      id: "a-s",
      href: "/admin?subject=a-s",
      action: "open",
      trail: "Course a",
    });
  });

  it("flags published content under a draft ancestor, pointing at the draft ancestor", () => {
    // published subject under a draft course → blocked; gap targets the course
    const tree = [course("a", false, [subject("a-s", true)])];
    const gaps = detectContentGaps(tree, coverAllChapters(tree));
    const blocked = gaps.filter((g) => g.kind === "blocked-publish");
    expect(blocked).toHaveLength(1);
    expect(blocked[0]).toMatchObject({ nodeKind: "course", id: "a", action: "publish" });
    // the blocking course must NOT also appear as a duplicate draft-course gap
    expect(gaps.filter((g) => g.id === "a")).toHaveLength(1);
  });

  it("detects a published resource trapped under a draft chapter", () => {
    const tree = [course("a", true, [subject("a-s", true, [chapter("a-s-ch", false)])])];
    const gaps = detectContentGaps(tree, [res("a-s-ch", true)]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ kind: "blocked-publish", nodeKind: "chapter", id: "a-s-ch" });
  });

  it("dedupes multiple blocked descendants to one gap per draft ancestor", () => {
    const tree = [course("a", false, [subject("s1", true), subject("s2", true)])];
    const gaps = detectContentGaps(tree, coverAllChapters(tree));
    expect(gaps.filter((g) => g.kind === "blocked-publish")).toHaveLength(1);
  });

  it("orders gaps by severity: blocked → empty → childless → draft", () => {
    const tree = [
      course("just-draft", false, []), // plain draft course (no descendants) → draft-course gap
      course("draft-c", false, [subject("draft-c-s", true, [])]), // blocked (published subject under draft course)
      course("ok", true, [
        subject("ok-s", true, [chapter("empty-ch", true)]), // empty published chapter
        subject("childless", true, []),
      ]),
    ];
    const gaps = detectContentGaps(tree, []);
    const kinds = gaps.map((g) => g.kind);
    const firstIndex = (k: string) => kinds.indexOf(k as (typeof gaps)[number]["kind"]);
    expect(firstIndex("blocked-publish")).toBeLessThan(firstIndex("empty-chapter"));
    expect(firstIndex("empty-chapter")).toBeLessThan(firstIndex("childless-subject"));
    expect(firstIndex("childless-subject")).toBeLessThan(firstIndex("draft-course"));
  });
});
