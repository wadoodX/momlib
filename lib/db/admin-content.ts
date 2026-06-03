import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  SEARCH_SELECT,
  RESOURCE_SEARCH_COLUMNS,
  MAX_SEARCH_RESULTS,
  shapeSearchResults,
  gatherStructure,
  type Chapter,
  type Course,
  type Resource,
  type ResourceSearchResult,
  type SearchRow,
  type StructureResults,
  type Subject,
} from "@/lib/db/content";
import { queryTerms, ilikeOrFilters } from "@/lib/search-match";

export type ChapterNode = Chapter;
export type SubjectNode = Subject & { chapters: ChapterNode[] };
export type CourseNode = Course & { subjects: SubjectNode[] };

/** Full Course → Subject → Chapter tree for the admin Content Studio (no resources). */
export async function getAdminTree(): Promise<CourseNode[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.from("courses").select("*, subjects(*, chapters(*))");

  if (error) {
    throw new Error(error.message);
  }

  const byOrder = <T extends { order_index: number; title: string }>(a: T, b: T) =>
    a.order_index - b.order_index || a.title.localeCompare(b.title);

  const courses = (data ?? []) as unknown as CourseNode[];
  courses.sort(byOrder);
  for (const course of courses) {
    course.subjects = (course.subjects ?? []).sort(byOrder);
    for (const subject of course.subjects) {
      subject.chapters = (subject.chapters ?? []).sort(byOrder);
    }
  }
  return courses;
}

export async function getAdminCourses() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Course[];
}

export async function getAdminCourse(courseId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as Course;
}

export async function getAdminSubjects(courseId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Subject[];
}

export async function getAdminSubject(subjectId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.from("subjects").select("*").eq("id", subjectId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as Subject;
}

export async function getAdminChapters(subjectId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter[];
}

export async function getAdminChapter(chapterId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.from("chapters").select("*").eq("id", chapterId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as Chapter;
}

export async function getAdminResources(chapterId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("order_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Resource[];
}

type StatBreakdown = { total: number; published: number; draft: number };

export type AdminStats = {
  courses: StatBreakdown;
  subjects: StatBreakdown;
  chapters: StatBreakdown;
  resources: StatBreakdown;
};

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();
  const supabase = await createClient();

  const countOf = (table: "courses" | "subjects" | "chapters" | "resources", published?: boolean) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (published !== undefined) {
      query = query.eq("is_published", published);
    }
    return query;
  };

  const [
    courses,
    coursesPublished,
    subjects,
    subjectsPublished,
    chapters,
    chaptersPublished,
    resources,
    resourcesPublished,
  ] = await Promise.all([
    countOf("courses"),
    countOf("courses", true),
    countOf("subjects"),
    countOf("subjects", true),
    countOf("chapters"),
    countOf("chapters", true),
    countOf("resources"),
    countOf("resources", true),
  ]);

  const breakdown = (
    total: { count: number | null },
    published: { count: number | null },
  ): StatBreakdown => {
    const t = total.count ?? 0;
    const p = published.count ?? 0;
    return { total: t, published: p, draft: t - p };
  };

  return {
    courses: breakdown(courses, coursesPublished),
    subjects: breakdown(subjects, subjectsPublished),
    chapters: breakdown(chapters, chaptersPublished),
    resources: breakdown(resources, resourcesPublished),
  };
}

export type AdminRecentResource = {
  id: string;
  title: string;
  trail: string;
  href: string;
  isPublished: boolean;
  updatedAt: string;
};

export async function getRecentResourcesForAdmin(limit = 5): Promise<AdminRecentResource[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("id, title, is_published, created_at, updated_at, chapter:chapters(id, title, subject:subjects(title, course:courses(title)))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  type RecentRow = {
    id: string;
    title: string;
    is_published: boolean;
    updated_at: string;
    chapter: { id: string; title: string; subject: { title: string; course: { title: string } | null } | null } | null;
  };

  return ((data ?? []) as unknown as RecentRow[]).map((row) => {
    const subject = row.chapter?.subject ?? null;
    const course = subject?.course ?? null;
    const trail = [course?.title, subject?.title, row.chapter?.title].filter(Boolean).join(" / ");

    return {
      id: row.id,
      title: row.title,
      trail: trail || "Unlinked",
      href: row.chapter ? `/admin/chapters/${row.chapter.id}` : "/admin",
      isPublished: row.is_published,
      updatedAt: row.updated_at,
    };
  });
}

export type ResourceType = Resource["resource_type"];

const RESOURCE_TYPES: ResourceType[] = ["pdf", "ppt", "doc", "image", "link", "video"];

export async function getResourceTypeBreakdown(): Promise<Record<ResourceType, number>> {
  await requireAdmin();
  const supabase = await createClient();

  // One grouped round trip (admin_resource_type_breakdown) instead of six
  // per-type count queries.
  const { data, error } = await supabase.rpc("admin_resource_type_breakdown");
  if (error) throw new Error(error.message);

  const breakdown = RESOURCE_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<ResourceType, number>);

  for (const row of data ?? []) {
    const type = row.resource_type as ResourceType;
    if (type in breakdown) breakdown[type] = row.count ?? 0;
  }

  return breakdown;
}

export type TopViewedChapter = {
  chapterId: string;
  title: string;
  trail: string;
  href: string;
  viewCount: number;
  learnerCount: number;
  lastViewedAt: string;
};

export async function getTopViewedChapters(limit = 5): Promise<TopViewedChapter[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_top_viewed_chapters", { limit_count: limit });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    chapterId: row.chapter_id,
    title: row.title,
    trail: `${row.course_title} / ${row.subject_title}`,
    href: `/admin?chapter=${row.chapter_id}`,
    viewCount: Number(row.view_count),
    learnerCount: Number(row.learner_count),
    lastViewedAt: row.last_viewed_at,
  }));
}

export type EngagementSummary = {
  totalViews: number;
  learners: number;
  views7d: number;
};

export async function getEngagementSummary(): Promise<EngagementSummary> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_engagement_summary");

  if (error) {
    throw new Error(error.message);
  }

  const row = data?.[0];
  return {
    totalViews: Number(row?.total_views ?? 0),
    learners: Number(row?.learners ?? 0),
    views7d: Number(row?.views_7d ?? 0),
  };
}

/** Teacher search across ALL content (published + drafts). */
export async function searchAllResources(query: string): Promise<ResourceSearchResult[]> {
  await requireAdmin();
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const terms = queryTerms(trimmed);
  if (terms.length === 0) {
    return [];
  }

  const supabase = await createClient();
  // ILIKE filters run in the database (chained .or() groups AND across terms),
  // so LIMIT caps actual matches rather than a first-N fetch window. Admins see
  // drafts too, so there are no publish filters here.
  const builder = supabase.from("resources").select(SEARCH_SELECT);

  for (const filter of ilikeOrFilters(terms, RESOURCE_SEARCH_COLUMNS)) {
    builder.or(filter);
  }

  const { data, error } = await builder.order("title", { ascending: true }).limit(MAX_SEARCH_RESULTS);

  if (error) {
    throw new Error(error.message);
  }

  return shapeSearchResults(supabase, (data ?? []) as unknown as SearchRow[], trimmed);
}

/** Teacher structure search across ALL courses/subjects/chapters (incl. drafts). */
export async function searchAllStructure(query: string): Promise<StructureResults> {
  await requireAdmin();
  if (query.trim().length < 2) {
    return { courses: [], subjects: [], chapters: [] };
  }
  const supabase = await createClient();
  return gatherStructure(supabase, query.trim(), true);
}

export async function getDraftCourses(): Promise<Course[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Course[];
}
