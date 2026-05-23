import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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

  return Promise.all((data as Resource[]).map((resource) => addResourceHref(resource)));
}

export async function searchPublishedResources(query: string): Promise<ResourceSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const supabase = await createClient();
  const escapedQuery = trimmedQuery.replaceAll("%", "\\%").replaceAll("_", "\\_");

  // Embed the published chapter -> subject -> course chain in one query.
  // `!inner` drops resources whose ancestor chain is not fully published,
  // mirroring the published-chain RLS policies, and replaces the previous
  // per-resource N+1 lookups.
  const { data, error } = await supabase
    .from("resources")
    .select(
      "*, chapter:chapters!inner(*, subject:subjects!inner(*, course:courses!inner(*)))",
    )
    .eq("is_published", true)
    .eq("chapter.is_published", true)
    .eq("chapter.subject.is_published", true)
    .eq("chapter.subject.course.is_published", true)
    .or(`title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,file_name.ilike.%${escapedQuery}%`)
    .order("title", { ascending: true })
    .limit(25);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as SearchRow[];

  return Promise.all(rows.map((row) => addResourceSearchContext(row)));
}

type SearchRow = Resource & {
  chapter: (Chapter & { subject: (Subject & { course: Course | null }) | null }) | null;
};

async function addResourceSearchContext(row: SearchRow): Promise<ResourceSearchResult> {
  const { chapter: chapterWithSubject, ...resource } = row;
  const subjectWithCourse = chapterWithSubject?.subject ?? null;
  const course = subjectWithCourse?.course ?? null;

  const resourceWithHref = await addResourceHref(resource as Resource);

  const chapter = chapterWithSubject ? omit(chapterWithSubject, "subject") as Chapter : null;
  const subject = subjectWithCourse ? omit(subjectWithCourse, "course") as Subject : null;

  return { ...resourceWithHref, chapter, subject, course };
}

function omit<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

async function addResourceHref(resource: Resource): Promise<ResourceLink> {
  if (resource.external_url) {
    return { ...resource, href: resource.external_url };
  }

  if (!resource.file_path) {
    return { ...resource, href: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("resources").createSignedUrl(resource.file_path, 60 * 60);

  if (error) {
    return { ...resource, href: null };
  }

  return { ...resource, href: data.signedUrl };
}
