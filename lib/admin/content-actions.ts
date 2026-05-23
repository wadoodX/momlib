"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { isColor, isIcon } from "@/lib/customization";
import type { Database } from "@/types/database";

type ResourceType = Database["public"]["Tables"]["resources"]["Row"]["resource_type"];
const maxUploadSize = 50 * 1024 * 1024;

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const title = getRequiredString(formData, "title");

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: await uniqueSlug(supabase, "courses", String(formData.get("slug") || title)),
      description: getOptionalString(formData, "description"),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = getRequiredString(formData, "course_id");
  const title = getRequiredString(formData, "title");

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug: getSlug(formData, title),
      description: getOptionalString(formData, "description"),
      color: getColor(formData),
      icon: getIcon(formData),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = getRequiredString(formData, "course_id");

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function createSubject(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const courseId = getRequiredString(formData, "course_id");
  const title = getRequiredString(formData, "title");

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      course_id: courseId,
      title,
      slug: await uniqueSlug(supabase, "subjects", String(formData.get("slug") || title), { column: "course_id", id: courseId }),
      description: getOptionalString(formData, "description"),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/subjects/${data.id}`);
}

export async function updateSubject(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const subjectId = getRequiredString(formData, "subject_id");
  const title = getRequiredString(formData, "title");

  const { error } = await supabase
    .from("subjects")
    .update({
      title,
      slug: getSlug(formData, title),
      description: getOptionalString(formData, "description"),
      color: getColor(formData),
      icon: getIcon(formData),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .eq("id", subjectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/subjects/${subjectId}`);
}

export async function deleteSubject(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const subjectId = getRequiredString(formData, "subject_id");
  const courseId = getRequiredString(formData, "course_id");

  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function createChapter(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const subjectId = getRequiredString(formData, "subject_id");
  const title = getRequiredString(formData, "title");

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      subject_id: subjectId,
      title,
      slug: await uniqueSlug(supabase, "chapters", String(formData.get("slug") || title), { column: "subject_id", id: subjectId }),
      description: getOptionalString(formData, "description"),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/subjects/${subjectId}`);
  redirect(`/admin/chapters/${data.id}`);
}

export async function updateChapter(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const chapterId = getRequiredString(formData, "chapter_id");
  const title = getRequiredString(formData, "title");

  const { error } = await supabase
    .from("chapters")
    .update({
      title,
      slug: getSlug(formData, title),
      description: getOptionalString(formData, "description"),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .eq("id", chapterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/chapters/${chapterId}`);
}

export async function deleteChapter(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const chapterId = getRequiredString(formData, "chapter_id");
  const subjectId = getRequiredString(formData, "subject_id");

  const { error } = await supabase.from("chapters").delete().eq("id", chapterId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/subjects/${subjectId}`);
  redirect(`/admin/subjects/${subjectId}`);
}

export async function createLinkResource(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const chapterId = getRequiredString(formData, "chapter_id");
  const url = getRequiredUrl(formData, "external_url");
  const isGamma = getCheckbox(formData, "is_gamma");

  if (isGamma && !isGammaUrl(url)) {
    throw new Error("Gamma links must use gamma.app or app.gamma.app.");
  }

  const { error } = await supabase.from("resources").insert({
    chapter_id: chapterId,
    title: getRequiredString(formData, "title"),
    description: getOptionalString(formData, "description"),
    resource_type: "link",
    external_url: url,
    order_index: getNumber(formData, "order_index"),
    is_published: getCheckbox(formData, "is_published"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/chapters/${chapterId}`);
}

export async function createFileResource(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const chapterId = getRequiredString(formData, "chapter_id");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  if (file.size > maxUploadSize) {
    throw new Error("File uploads must be 50MB or smaller.");
  }

  const resourceId = crypto.randomUUID();
  const fileName = sanitizeFileName(file.name);
  const filePath = await buildResourcePath(chapterId, resourceId, fileName);
  const resourceType = inferResourceType(file);

  const upload = await supabase.storage.from("resources").upload(filePath, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (upload.error) {
    throw new Error(upload.error.message);
  }

  const { error } = await supabase.from("resources").insert({
    id: resourceId,
    chapter_id: chapterId,
    title: getRequiredString(formData, "title"),
    description: getOptionalString(formData, "description"),
    resource_type: resourceType,
    file_path: filePath,
    file_name: fileName,
    file_size: file.size,
    mime_type: file.type || null,
    order_index: getNumber(formData, "order_index"),
    is_published: getCheckbox(formData, "is_published"),
  });

  if (error) {
    await supabase.storage.from("resources").remove([filePath]);
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/chapters/${chapterId}`);
}

export async function updateResource(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const resourceId = getRequiredString(formData, "resource_id");
  const chapterId = getRequiredString(formData, "chapter_id");

  const { error } = await supabase
    .from("resources")
    .update({
      title: getRequiredString(formData, "title"),
      description: getOptionalString(formData, "description"),
      order_index: getNumber(formData, "order_index"),
      is_published: getCheckbox(formData, "is_published"),
    })
    .eq("id", resourceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/chapters/${chapterId}`);
}

export async function deleteResource(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const resourceId = getRequiredString(formData, "resource_id");
  const chapterId = getRequiredString(formData, "chapter_id");
  const filePath = getOptionalString(formData, "file_path");

  const { error } = await supabase.from("resources").delete().eq("id", resourceId);

  if (error) {
    throw new Error(error.message);
  }

  if (filePath) {
    await supabase.storage.from("resources").remove([filePath]);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/chapters/${chapterId}`);
}

function getRequiredString(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function getOptionalString(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function getNumber(formData: FormData, name: string) {
  const value = Number(formData.get(name) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getCheckbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function getColor(formData: FormData) {
  const value = getOptionalString(formData, "color");
  return isColor(value) ? value : null;
}

function getIcon(formData: FormData) {
  const value = getOptionalString(formData, "icon");
  return isIcon(value) ? value : null;
}

function getSlug(formData: FormData, fallback: string) {
  return slugify(String(formData.get("slug") || fallback));
}

function getRequiredUrl(formData: FormData, name: string) {
  const value = getRequiredString(formData, name);

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Links must start with http:// or https://.");
  }

  return url.toString();
}

function sanitizeFileName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "resource";
}

function isGammaUrl(value: string) {
  const hostname = new URL(value).hostname;
  return hostname === "gamma.app" || hostname.endsWith(".gamma.app");
}

function inferResourceType(file: File): ResourceType {
  const mime = file.type;
  const name = file.name.toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.includes("powerpoint") || name.endsWith(".ppt") || name.endsWith(".pptx")) return "ppt";
  if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";

  throw new Error("Unsupported file type. Upload PDF, PPT/PPTX, DOC/DOCX, images, or videos.");
}

async function buildResourcePath(chapterId: string, resourceId: string, fileName: string) {
  const supabase = await createClient();
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, subject_id")
    .eq("id", chapterId)
    .single();

  if (chapterError) {
    throw new Error(chapterError.message);
  }

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, course_id")
    .eq("id", chapter.subject_id)
    .single();

  if (subjectError) {
    throw new Error(subjectError.message);
  }

  return `courses/${subject.course_id}/subjects/${subject.id}/chapters/${chapter.id}/${resourceId}-${fileName}`;
}
