import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPublishedCourses,
  getPublishedCourseBySlug,
  getPublishedSubjectsForCourse,
  getPublishedSubjectBySlug,
  getPublishedChaptersForSubject,
  getPublishedChapterBySlug,
  searchPublishedResources,
  getStudentStats,
  gatherStructure,
} from "@/lib/db/content";
import { createClient } from "@/lib/supabase/server";

// Records the table + every .eq() filter per query, so we can assert the
// "published chain" rule is mirrored in app queries: every student-facing read
// filters is_published = true (a dropped filter would expose unpublished content).
// Each .from() gets its OWN recorder so multi-query functions (gatherStructure,
// getStudentStats) are covered too.
const mocks = vi.hoisted(() => ({
  rows: [] as unknown[],
  queries: [] as { table: string; eq: [string, unknown][]; or: string[] }[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const rec = { table, eq: [] as [string, unknown][], or: [] as string[] };
      mocks.queries.push(rec);
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: (col: string, val: unknown) => {
          rec.eq.push([col, val]);
          return builder;
        },
        or: (filter: string) => {
          rec.or.push(filter);
          return builder;
        },
        order: () => builder,
        limit: () => builder,
        maybeSingle: async () => ({ data: mocks.rows[0] ?? null, error: null }),
        // awaiting the builder resolves to { data, error, count } (count for head queries)
        then: (resolve: (v: { data: unknown[]; error: null; count: number }) => unknown) =>
          resolve({ data: mocks.rows, error: null, count: mocks.rows.length }),
      };
      return builder;
    },
  }),
}));

beforeEach(() => {
  mocks.rows = [];
  mocks.queries = [];
});

/** Did the query apply an exact .eq(col, val)? */
function hasEq(q: { eq: [string, unknown][] }, col: string, val: unknown) {
  return q.eq.some(([c, v]) => c === col && v === val);
}

describe("published-chain filtering — single-level getters", () => {
  it("getPublishedCourses filters is_published on courses", async () => {
    await getPublishedCourses();
    const q = mocks.queries[0];
    expect(q.table).toBe("courses");
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedCourseBySlug filters slug AND is_published", async () => {
    await getPublishedCourseBySlug("fiqh");
    const q = mocks.queries[0];
    expect(q.table).toBe("courses");
    expect(hasEq(q, "slug", "fiqh")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedSubjectsForCourse scopes to the course AND filters is_published", async () => {
    await getPublishedSubjectsForCourse("course-1");
    const q = mocks.queries[0];
    expect(q.table).toBe("subjects");
    expect(hasEq(q, "course_id", "course-1")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedSubjectBySlug scopes to the course, matches slug, AND filters is_published", async () => {
    await getPublishedSubjectBySlug("course-1", "salah");
    const q = mocks.queries[0];
    expect(q.table).toBe("subjects");
    expect(hasEq(q, "course_id", "course-1")).toBe(true);
    expect(hasEq(q, "slug", "salah")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedChaptersForSubject scopes to the subject AND filters is_published", async () => {
    await getPublishedChaptersForSubject("subject-1");
    const q = mocks.queries[0];
    expect(q.table).toBe("chapters");
    expect(hasEq(q, "subject_id", "subject-1")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });

  it("getPublishedChapterBySlug scopes to the subject, matches slug, AND filters is_published", async () => {
    await getPublishedChapterBySlug("subject-1", "intro");
    const q = mocks.queries[0];
    expect(q.table).toBe("chapters");
    expect(hasEq(q, "subject_id", "subject-1")).toBe(true);
    expect(hasEq(q, "slug", "intro")).toBe(true);
    expect(hasEq(q, "is_published", true)).toBe(true);
  });
});

describe("published-chain filtering — embedded multi-level filters", () => {
  it("searchPublishedResources filters is_published up the FULL chain", async () => {
    await searchPublishedResources("salah times");
    const q = mocks.queries[0];
    expect(q.table).toBe("resources");
    expect(hasEq(q, "is_published", true)).toBe(true);
    expect(hasEq(q, "chapter.is_published", true)).toBe(true);
    expect(hasEq(q, "chapter.subject.is_published", true)).toBe(true);
    expect(hasEq(q, "chapter.subject.course.is_published", true)).toBe(true);
    expect(q.or.length).toBeGreaterThan(0); // search-term ILIKE filters are applied
  });

  it("getStudentStats counts only the student's visible published chain (viewed chapters)", async () => {
    await getStudentStats();
    // queries: [0] courses, [1] chapters, [2] resources, [3] chapter_views
    const courses = mocks.queries[0];
    const viewed = mocks.queries[3];
    expect(hasEq(courses, "is_published", true)).toBe(true);
    expect(viewed.table).toBe("chapter_views");
    expect(hasEq(viewed, "chapter.is_published", true)).toBe(true);
    expect(hasEq(viewed, "chapter.subject.is_published", true)).toBe(true);
    expect(hasEq(viewed, "chapter.subject.course.is_published", true)).toBe(true);
  });
});

describe("gatherStructure — student vs admin visibility", () => {
  it("students get only fully-published chains (filters at every level)", async () => {
    const supabase = await createClient();
    await gatherStructure(supabase, "intro", false);
    const [courses, subjects, chapters] = mocks.queries;
    expect(courses.table).toBe("courses");
    expect(hasEq(courses, "is_published", true)).toBe(true);
    expect(subjects.table).toBe("subjects");
    expect(hasEq(subjects, "is_published", true)).toBe(true);
    expect(hasEq(subjects, "course.is_published", true)).toBe(true);
    expect(chapters.table).toBe("chapters");
    expect(hasEq(chapters, "is_published", true)).toBe(true);
    expect(hasEq(chapters, "subject.is_published", true)).toBe(true);
    expect(hasEq(chapters, "subject.course.is_published", true)).toBe(true);
    // each entity is also matched on its own title (search-term ILIKE filters)
    expect(courses.or.length).toBeGreaterThan(0);
    expect(subjects.or.length).toBeGreaterThan(0);
    expect(chapters.or.length).toBeGreaterThan(0);
  });

  it("admins (includeUnpublished) get NO is_published filters", async () => {
    const supabase = await createClient();
    await gatherStructure(supabase, "intro", true);
    for (const q of mocks.queries) {
      expect(q.eq.some(([c]) => String(c).endsWith("is_published"))).toBe(false);
    }
  });
});
