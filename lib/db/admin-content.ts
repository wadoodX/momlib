import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Chapter, Course, Resource, Subject } from "@/lib/db/content";

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
