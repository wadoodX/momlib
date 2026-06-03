import { describe, it, expect, beforeEach, vi } from "vitest";

// Records the table + every .eq() filter applied per query, so we can assert the
// "published chain" rule is mirrored in app queries: every student-facing read
// filters is_published = true (a dropped filter would expose unpublished content).
const mocks = vi.hoisted(() => ({
  rows: [] as unknown[],
  queries: [] as { table: string; eq: [string, unknown][] }[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    const rec = { table: "", eq: [] as [string, unknown][] };
    mocks.queries.push(rec);
    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        rec.eq.push([col, val]);
        return builder;
      },
      order: () => builder,
      maybeSingle: async () => ({ data: mocks.rows[0] ?? null, error: null }),
      // awaiting the builder (list queries) resolves to { data, error }
      then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
        resolve({ data: mocks.rows, error: null }),
    };
    return { from: (table: string) => ((rec.table = table), builder) };
  },
}));

beforeEach(() => {
  mocks.rows = [];
  mocks.queries = [];
});

/** Did the query apply an exact .eq(col, val)? */
function hasEq(q: { eq: [string, unknown][] }, col: string, val: unknown) {
  return q.eq.some(([c, v]) => c === col && v === val);
}

describe("published-chain filtering in lib/db/content", () => {
  it("getPublishedCourses filters is_published on courses", async () => {
    const { getPublishedCourses } = await import("@/lib/db/content");
    await getPublishedCourses();
    const q = mocks.queries[0];
    expect(q.table).toBe("courses");
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedCourseBySlug filters slug AND is_published", async () => {
    const { getPublishedCourseBySlug } = await import("@/lib/db/content");
    await getPublishedCourseBySlug("fiqh");
    const q = mocks.queries[0];
    expect(q.table).toBe("courses");
    expect(hasEq(q, "slug", "fiqh")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedSubjectsForCourse scopes to the course AND filters is_published", async () => {
    const { getPublishedSubjectsForCourse } = await import("@/lib/db/content");
    await getPublishedSubjectsForCourse("course-1");
    const q = mocks.queries[0];
    expect(q.table).toBe("subjects");
    expect(hasEq(q, "course_id", "course-1")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedSubjectBySlug scopes to the course, matches slug, AND filters is_published", async () => {
    const { getPublishedSubjectBySlug } = await import("@/lib/db/content");
    await getPublishedSubjectBySlug("course-1", "salah");
    const q = mocks.queries[0];
    expect(q.table).toBe("subjects");
    expect(hasEq(q, "course_id", "course-1")).toBe(true);
    expect(hasEq(q, "slug", "salah")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedChaptersForSubject scopes to the subject AND filters is_published", async () => {
    const { getPublishedChaptersForSubject } = await import("@/lib/db/content");
    await getPublishedChaptersForSubject("subject-1");
    const q = mocks.queries[0];
    expect(q.table).toBe("chapters");
    expect(hasEq(q, "subject_id", "subject-1")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedChapterBySlug scopes to the subject, matches slug, AND filters is_published", async () => {
    const { getPublishedChapterBySlug } = await import("@/lib/db/content");
    await getPublishedChapterBySlug("subject-1", "intro");
    const q = mocks.queries[0];
    expect(q.table).toBe("chapters");
    expect(hasEq(q, "subject_id", "subject-1")).toBe(true);
    expect(hasEq(q, "slug", "intro")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });
});
