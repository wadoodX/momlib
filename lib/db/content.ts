import { createClient } from "@/lib/supabase/server";
import { signedResourceUrl } from "@/lib/storage/resources";
import { queryTerms, titleMatches, rowMatchesQuery, ilikeOrFilters } from "@/lib/search-match";
import type { Database } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];

export type ResourceLink = Resource & {
  href: string | null;
};

export type ResourceSearchResult = Resource & {
  course: Course | null;
  subject: Subject | null;
  chapter: Chapter | null;
  href: string | null;
};

export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Course[];
}

export type CourseWithCount = Course & { subjectCount: number };

/** Published courses, each annotated with its count of published subjects.
 *  Counts are tallied in JS from a single `course_id` fetch (both queries are
 *  RLS-scoped to published rows), avoiding the embedded-count-with-filter
 *  pitfalls of `subjects(count)`. */
export async function getPublishedCoursesWithCounts(): Promise<CourseWithCount[]> {
  const supabase = await createClient();

  const [coursesRes, subjectsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })
      .order("title", { ascending: true }),
    supabase.from("subjects").select("course_id").eq("is_published", true),
  ]);

  if (coursesRes.error) {
    throw new Error(coursesRes.error.message);
  }
  if (subjectsRes.error) {
    throw new Error(subjectsRes.error.message);
  }

  const counts = new Map<string, number>();
  for (const row of (subjectsRes.data ?? []) as { course_id: string }[]) {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
  }

  return (coursesRes.data as Course[]).map((course) => ({
    ...course,
    subjectCount: counts.get(course.id) ?? 0,
  }));
}

export async function getPublishedCourseBySlug(courseSlug: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Course | null;
}

export async function getPublishedSubjectsForCourse(courseId: string): Promise<Subject[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Subject[];
}

export async function getPublishedSubjectBySlug(courseId: string, subjectSlug: string): Promise<Subject | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId)
    .eq("slug", subjectSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subject | null;
}

export async function getPublishedChaptersForSubject(subjectId: string): Promise<Chapter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter[];
}

export async function getPublishedChapterBySlug(subjectId: string, chapterSlug: string): Promise<Chapter | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("slug", chapterSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter | null;
}

export async function getPublishedResourcesForChapter(chapterId: string): Promise<ResourceLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all((data as Resource[]).map((resource) => addResourceHref(supabase, resource)));
}

// Embed the chapter -> subject -> course chain so search results carry their
// trail and can be matched against parent titles. `!inner` keeps the joins.
export const SEARCH_SELECT =
  "*, chapter:chapters!inner(*, subject:subjects!inner(*, course:courses!inner(*)))";

export type SearchRow = Resource & {
  chapter: (Chapter & { subject: (Subject & { course: Course | null }) | null }) | null;
};

// Resource fields searched (mirrors rowMatchesQuery's haystack) — used to build
// the database-side ILIKE filter so matches aren't capped by a fetch window.
export const RESOURCE_SEARCH_COLUMNS = ["title", "description", "file_name"];

export const MAX_SEARCH_RESULTS = 25;

/** Shared search core: filter candidate rows in JS, then shape only the few
 *  shown rows (signing URLs is relatively expensive). */
export async function shapeSearchResults(
  supabase: SupabaseServerClient,
  rows: SearchRow[],
  query: string,
): Promise<ResourceSearchResult[]> {
  const matched = rows.filter((row) => rowMatchesQuery(row, query)).slice(0, MAX_SEARCH_RESULTS);
  return Promise.all(matched.map((row) => addResourceSearchContext(supabase, row)));
}

export async function searchPublishedResources(query: string): Promise<ResourceSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const terms = queryTerms(trimmedQuery);
  if (terms.length === 0) {
    return [];
  }

  const supabase = await createClient();

  // Only fully-published chains are visible to students (mirrors RLS).
  // The ILIKE filters run in the database so LIMIT caps actual matches rather
  // than a pre-filter window (chained .or() groups are AND-ed across terms).
  const builder = supabase
    .from("resources")
    .select(SEARCH_SELECT)
    .eq("is_published", true)
    .eq("chapter.is_published", true)
    .eq("chapter.subject.is_published", true)
    .eq("chapter.subject.course.is_published", true);

  for (const filter of ilikeOrFilters(terms, RESOURCE_SEARCH_COLUMNS)) {
    builder.or(filter);
  }

  const { data, error } = await builder.order("title", { ascending: true }).limit(MAX_SEARCH_RESULTS);

  if (error) {
    throw new Error(error.message);
  }

  return shapeSearchResults(supabase, (data ?? []) as unknown as SearchRow[], trimmedQuery);
}

/* ---------- structure search (courses / subjects / chapters by their own name) ---------- */

type Ref = { id: string; title: string; slug: string };
export type CourseHit = Ref & { is_published: boolean };
export type SubjectHit = Ref & { is_published: boolean; course: Ref };
export type ChapterHit = Ref & { is_published: boolean; course: Ref; subject: Ref };
export type StructureResults = { courses: CourseHit[]; subjects: SubjectHit[]; chapters: ChapterHit[] };

const STRUCTURE_LIMIT = 25;

/**
 * Search courses/subjects/chapters by their OWN title. `includeUnpublished`
 * is for admins; students get only fully-published chains (mirrors RLS).
 * Takes a Supabase client so both the student and admin entry points reuse it.
 */
export async function gatherStructure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  includeUnpublished: boolean,
): Promise<StructureResults> {
  const terms = queryTerms(query);
  if (terms.length === 0) {
    return { courses: [], subjects: [], chapters: [] };
  }

  const coursesQuery = supabase.from("courses").select("id, title, slug, is_published");
  const subjectsQuery = supabase
    .from("subjects")
    .select("id, title, slug, is_published, course:courses!inner(id, title, slug, is_published)");
  const chaptersQuery = supabase
    .from("chapters")
    .select(
      "id, title, slug, is_published, subject:subjects!inner(id, title, slug, is_published, course:courses!inner(id, title, slug, is_published))",
    );

  if (!includeUnpublished) {
    coursesQuery.eq("is_published", true);
    subjectsQuery.eq("is_published", true).eq("course.is_published", true);
    chaptersQuery
      .eq("is_published", true)
      .eq("subject.is_published", true)
      .eq("subject.course.is_published", true);
  }

  // Match each entity on its OWN title in the database (every term must appear),
  // so the LIMIT caps matches instead of an arbitrary first-N window.
  for (const filter of ilikeOrFilters(terms, ["title"])) {
    coursesQuery.or(filter);
    subjectsQuery.or(filter);
    chaptersQuery.or(filter);
  }

  const [courses, subjects, chapters] = await Promise.all([
    coursesQuery.order("title").limit(STRUCTURE_LIMIT),
    subjectsQuery.order("title").limit(STRUCTURE_LIMIT),
    chaptersQuery.order("title").limit(STRUCTURE_LIMIT),
  ]);

  if (courses.error) throw new Error(courses.error.message);
  if (subjects.error) throw new Error(subjects.error.message);
  if (chapters.error) throw new Error(chapters.error.message);

  type SubjRow = CourseHit & { course: Ref };
  type ChapRow = CourseHit & { subject: Ref & { course: Ref } };

  return {
    courses: ((courses.data ?? []) as CourseHit[])
      .filter((c) => titleMatches(c.title, terms))
      .slice(0, STRUCTURE_LIMIT),
    subjects: ((subjects.data ?? []) as unknown as SubjRow[])
      .filter((s) => titleMatches(s.title, terms))
      .slice(0, STRUCTURE_LIMIT)
      .map((s) => ({ id: s.id, title: s.title, slug: s.slug, is_published: s.is_published, course: s.course })),
    chapters: ((chapters.data ?? []) as unknown as ChapRow[])
      .filter((c) => titleMatches(c.title, terms))
      .slice(0, STRUCTURE_LIMIT)
      .map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        is_published: c.is_published,
        subject: { id: c.subject.id, title: c.subject.title, slug: c.subject.slug },
        course: c.subject.course,
      })),
  };
}

export async function searchPublishedStructure(query: string): Promise<StructureResults> {
  if (query.trim().length < 2) {
    return { courses: [], subjects: [], chapters: [] };
  }
  const supabase = await createClient();
  return gatherStructure(supabase, query.trim(), false);
}

export async function addResourceSearchContext(
  supabase: SupabaseServerClient,
  row: SearchRow,
): Promise<ResourceSearchResult> {
  const { chapter: chapterWithSubject, ...resource } = row;
  const subjectWithCourse = chapterWithSubject?.subject ?? null;
  const course = subjectWithCourse?.course ?? null;

  const resourceWithHref = await addResourceHref(supabase, resource as Resource);

  const chapter = chapterWithSubject ? omit(chapterWithSubject, "subject") as Chapter : null;
  const subject = subjectWithCourse ? omit(subjectWithCourse, "course") as Subject : null;

  return { ...resourceWithHref, chapter, subject, course };
}

function omit<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

// Signs the file for `resource`. Callers must only pass resources already loaded
// by a published-chain-filtered query — R2 signing has no RLS (see signedResourceUrl).
async function addResourceHref(supabase: SupabaseServerClient, resource: Resource): Promise<ResourceLink> {
  if (resource.external_url) {
    return { ...resource, href: resource.external_url };
  }

  if (!resource.file_path) {
    return { ...resource, href: null };
  }

  const href = await signedResourceUrl(supabase, resource.file_path, 60 * 60);

  return { ...resource, href };
}

export type StudentStats = {
  courses: number;
  chapters: number;
  resources: number;
  viewedChapters: number;
};

export async function getStudentStats(): Promise<StudentStats> {
  const supabase = await createClient();

  // Counts run under RLS, so they only include the published chain a student can access.
  // `viewedChapters` counts the student's own chapter_views whose published chain is
  // still visible (same `!inner` embed used by getRecentlyViewedChapters).
  const [courses, chapters, resources, viewedChapters] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("chapters").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("resources").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase
      .from("chapter_views")
      .select(
        "chapter_id, chapter:chapters!inner(is_published, subject:subjects!inner(is_published, course:courses!inner(is_published)))",
        { count: "exact", head: true },
      )
      .eq("chapter.is_published", true)
      .eq("chapter.subject.is_published", true)
      .eq("chapter.subject.course.is_published", true),
  ]);

  return {
    courses: courses.count ?? 0,
    chapters: chapters.count ?? 0,
    resources: resources.count ?? 0,
    viewedChapters: viewedChapters.count ?? 0,
  };
}

export async function recordChapterView(chapterId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  // RLS limits writes to the signed-in user's own rows. View tracking is
  // best-effort and runs during page render, so log a failure rather than throw
  // (throwing would break the chapter page).
  const { error } = await supabase
    .from("chapter_views")
    .upsert({ user_id: user.id, chapter_id: chapterId, viewed_at: new Date().toISOString() }, { onConflict: "user_id,chapter_id" });

  if (error) {
    console.error(`Failed to record chapter view for ${chapterId}: ${error.message}`);
  }
}

export type RecentChapter = {
  chapterId: string;
  title: string;
  trail: string;
  href: string;
  viewedAt: string;
  icon: string | null;
  color: string | null;
};

export async function getRecentlyViewedChapters(limit = 6): Promise<RecentChapter[]> {
  const supabase = await createClient();

  // chapter_views is RLS-scoped to the current user; `!inner` drops chapters whose
  // published chain is no longer visible. The explicit is_published filters mirror
  // getStudentStats and the published-chain rule, so this stays correct (and the
  // limit caps real matches) even if chapter RLS were ever relaxed.
  const { data, error } = await supabase
    .from("chapter_views")
    .select("viewed_at, chapter:chapters!inner(*, subject:subjects!inner(*, course:courses!inner(*)))")
    .eq("chapter.is_published", true)
    .eq("chapter.subject.is_published", true)
    .eq("chapter.subject.course.is_published", true)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  type ViewRow = {
    viewed_at: string;
    chapter: Chapter & { subject: (Subject & { course: Course | null }) | null };
  };

  return ((data ?? []) as unknown as ViewRow[])
    .map((row) => {
      const chapter = row.chapter;
      const subject = chapter?.subject ?? null;
      const course = subject?.course ?? null;

      if (!chapter || !subject || !course) {
        return null;
      }

      return {
        chapterId: chapter.id,
        title: chapter.title,
        trail: `${course.title} / ${subject.title}`,
        href: `/courses/${course.slug}/${subject.slug}/${chapter.slug}`,
        viewedAt: row.viewed_at,
        // Inherit the visual identity from the subject, falling back to the course.
        icon: subject.icon ?? course.icon,
        color: subject.color ?? course.color,
      };
    })
    .filter((item): item is RecentChapter => item !== null);
}
