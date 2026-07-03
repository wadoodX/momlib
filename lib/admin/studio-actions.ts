"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getAdminResources } from "@/lib/db/admin-content";
import { uniqueSlug, nextOrderIndex } from "@/lib/admin/slug";
import { deleteNodeAndStorage } from "@/lib/admin/storage-cleanup";
import { copyResource, removeResources } from "@/lib/storage/resources";
import type { Resource, ResourceLink } from "@/lib/db/content";

export type NodeKind = "course" | "subject" | "chapter";
export type ReorderKind = NodeKind | "resource";

/**
 * Create a course/subject/chapter from just a title (slug auto-generated &
 * de-duplicated, appended to the end of its sibling group). Returns the new id
 * so the client can select it. No redirect — the studio stays in place.
 */
export async function quickAdd(
  kind: NodeKind,
  parentId: string | null,
  rawTitle: string,
): Promise<{ id: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const title = rawTitle.trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  let id: string;

  if (kind === "course") {
    const slug = await uniqueSlug(supabase, "courses", title);
    const order_index = await nextOrderIndex(supabase, "courses");
    const { data, error } = await supabase
      .from("courses")
      .insert({ title, slug, order_index })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  } else if (kind === "subject") {
    if (!parentId) throw new Error("A course is required.");
    const slug = await uniqueSlug(supabase, "subjects", title, { column: "course_id", id: parentId });
    const order_index = await nextOrderIndex(supabase, "subjects", { column: "course_id", id: parentId });
    const { data, error } = await supabase
      .from("subjects")
      .insert({ course_id: parentId, title, slug, order_index })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  } else {
    if (!parentId) throw new Error("A subject is required.");
    const slug = await uniqueSlug(supabase, "chapters", title, { column: "subject_id", id: parentId });
    const order_index = await nextOrderIndex(supabase, "chapters", { column: "subject_id", id: parentId });
    const { data, error } = await supabase
      .from("chapters")
      .insert({ subject_id: parentId, title, slug, order_index })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    id = data.id;
  }

  revalidatePath("/admin");
  // quickAdd + setPublished are also invoked from the teacher dashboard
  // (Mission Control), so its RSC payload must refresh too. The other studio
  // actions are only reachable from /admin and keep the single revalidate.
  revalidatePath("/dashboard");
  return { id };
}

/** Persist a new sibling order by writing each row's order_index to its array index. */
export async function reorder(kind: ReorderKind, orderedIds: string[]): Promise<void> {
  await requireAdmin();

  // Guard the trusted client input: ignore empties and cap the fan-out so a
  // malformed payload can't kick off thousands of UPDATEs.
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;
  if (orderedIds.length > 1000) {
    throw new Error("Too many items to reorder at once.");
  }

  const supabase = await createClient();

  const table =
    kind === "course" ? "courses" : kind === "subject" ? "subjects" : kind === "chapter" ? "chapters" : "resources";

  // Don't swallow per-row failures: if any update errors, surface it so the UI
  // re-syncs from the server instead of showing a stale "saved" order.
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from(table).update({ order_index: index }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw new Error(`Failed to reorder ${kind}: ${failed.error.message}`);
  }

  revalidatePath("/admin");
}

/** Delete a node (children cascade) without redirecting away from the studio.
 *  Also purges the Storage files of every descendant resource. */
export async function deleteNode(kind: NodeKind, id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  await deleteNodeAndStorage(supabase, kind, id);

  revalidatePath("/admin");
}

/** Lazy-load a chapter's resources (with signed hrefs for preview) for the detail pane. */
export async function listChapterResources(chapterId: string): Promise<ResourceLink[]> {
  await requireAdmin();
  return getAdminResources(chapterId);
}

function tableFor(kind: NodeKind) {
  return kind === "course" ? "courses" : kind === "subject" ? "subjects" : "chapters";
}

/** Rename a node — updates ONLY the title (slug, order, and publish state are preserved). */
export async function renameNode(kind: NodeKind, id: string, rawTitle: string): Promise<void> {
  await requireAdmin();
  const title = rawTitle.trim();
  if (!title) throw new Error("Title is required.");

  const supabase = await createClient();
  const { error } = await supabase.from(tableFor(kind)).update({ title }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

/** Publish or unpublish a node. */
export async function setPublished(kind: NodeKind, id: string, isPublished: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tableFor(kind)).update({ is_published: isPublished }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/dashboard"); // dashboard queue/stats render publish state (see quickAdd note)
}

/* ---------- recursive duplicate ---------- */

type ResRow = {
  title: string;
  description: string | null;
  resource_type: Resource["resource_type"];
  category: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  external_url: string | null;
  is_paid: boolean;
  payhip_url: string | null;
  order_index: number;
  is_published: boolean;
};
type ChapRow = { title: string; description: string | null; order_index: number; is_published: boolean; resources: ResRow[] | null };
type SubjRow = { title: string; description: string | null; order_index: number; is_published: boolean; chapters: ChapRow[] | null };

type Client = Awaited<ReturnType<typeof createClient>>;

async function cloneResources(
  supabase: Client,
  resources: ResRow[],
  dstChapterId: string,
  courseId: string,
  subjectId: string,
  copied: string[],
) {
  for (const r of resources) {
    const newId = crypto.randomUUID();
    let filePath: string | null = null;

    if (r.file_path) {
      const fileName = r.file_name ?? "resource";
      const newPath = `courses/${courseId}/subjects/${subjectId}/chapters/${dstChapterId}/${newId}-${fileName}`;
      // Server-side copy: no re-upload, and the copy gets its own file so
      // deleting it later never removes the original's object.
      await copyResource(supabase, r.file_path, newPath);
      copied.push(newPath); // track for cleanup if the duplicate later fails
      filePath = newPath;
    }

    const { error } = await supabase.from("resources").insert({
      id: newId,
      chapter_id: dstChapterId,
      title: r.title,
      description: r.description,
      resource_type: r.resource_type,
      category: r.category,
      file_path: filePath,
      file_name: r.file_name,
      file_size: r.file_size,
      mime_type: r.mime_type,
      external_url: r.external_url,
      is_paid: r.is_paid,
      payhip_url: r.payhip_url,
      order_index: r.order_index,
      is_published: r.is_published,
    });
    if (error) throw new Error(error.message);
  }
}

async function cloneChapter(supabase: Client, chapter: ChapRow, dstSubjectId: string, courseId: string, copied: string[]) {
  const slug = await uniqueSlug(supabase, "chapters", chapter.title, { column: "subject_id", id: dstSubjectId });
  const { data, error } = await supabase
    .from("chapters")
    .insert({
      subject_id: dstSubjectId,
      title: chapter.title,
      slug,
      description: chapter.description,
      order_index: chapter.order_index,
      is_published: chapter.is_published,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await cloneResources(supabase, chapter.resources ?? [], data.id, courseId, dstSubjectId, copied);
}

async function cloneSubject(supabase: Client, subject: SubjRow, dstCourseId: string, copied: string[]) {
  const slug = await uniqueSlug(supabase, "subjects", subject.title, { column: "course_id", id: dstCourseId });
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      course_id: dstCourseId,
      title: subject.title,
      slug,
      description: subject.description,
      order_index: subject.order_index,
      is_published: subject.is_published,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  for (const chapter of subject.chapters ?? []) {
    await cloneChapter(supabase, chapter, data.id, dstCourseId, copied);
  }
}

/** Best-effort rollback if a duplicate fails midway: delete the new top node
 *  (children cascade) and remove any storage files copied so far. */
async function rollbackDuplicate(
  supabase: Client,
  table: "courses" | "subjects" | "chapters",
  id: string,
  copied: string[],
) {
  if (copied.length > 0) {
    await removeResources(supabase, copied);
  }
  await supabase.from(table).delete().eq("id", id);
}

/**
 * Deep-clone a node and everything inside it. The new top node is titled
 * "… (copy)", gets a unique slug, appends to the end, and is left unpublished;
 * descendants keep their original publish state. Returns the new node so the
 * client can select it.
 */
export async function duplicateNode(kind: NodeKind, id: string): Promise<{ kind: NodeKind; id: string }> {
  await requireAdmin();
  const supabase = await createClient();

  if (kind === "course") {
    const { data: src, error } = await supabase
      .from("courses")
      .select("*, subjects(*, chapters(*, resources(*)))")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);

    const title = `${src.title} (copy)`;
    const slug = await uniqueSlug(supabase, "courses", title);
    const order_index = await nextOrderIndex(supabase, "courses");
    const { data: course, error: insErr } = await supabase
      .from("courses")
      .insert({ title, slug, description: src.description, order_index, is_published: false })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const copied: string[] = [];
    try {
      for (const subject of (src.subjects ?? []) as unknown as SubjRow[]) {
        await cloneSubject(supabase, subject, course.id, copied);
      }
    } catch (e) {
      await rollbackDuplicate(supabase, "courses", course.id, copied);
      throw e;
    }
    revalidatePath("/admin");
    return { kind: "course", id: course.id };
  }

  if (kind === "subject") {
    const { data: src, error } = await supabase
      .from("subjects")
      .select("*, chapters(*, resources(*))")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);

    const courseId = src.course_id;
    const title = `${src.title} (copy)`;
    const slug = await uniqueSlug(supabase, "subjects", title, { column: "course_id", id: courseId });
    const order_index = await nextOrderIndex(supabase, "subjects", { column: "course_id", id: courseId });
    const { data: subject, error: insErr } = await supabase
      .from("subjects")
      .insert({ course_id: courseId, title, slug, description: src.description, order_index, is_published: false })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const copied: string[] = [];
    try {
      for (const chapter of (src.chapters ?? []) as unknown as ChapRow[]) {
        await cloneChapter(supabase, chapter, subject.id, courseId, copied);
      }
    } catch (e) {
      await rollbackDuplicate(supabase, "subjects", subject.id, copied);
      throw e;
    }
    revalidatePath("/admin");
    return { kind: "subject", id: subject.id };
  }

  // chapter
  const { data: src, error } = await supabase
    .from("chapters")
    .select("*, resources(*)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const subjectId = src.subject_id;
  const { data: subjectRow, error: subjErr } = await supabase
    .from("subjects")
    .select("course_id")
    .eq("id", subjectId)
    .single();
  if (subjErr) throw new Error(subjErr.message);
  const courseId = subjectRow.course_id;

  const title = `${src.title} (copy)`;
  const slug = await uniqueSlug(supabase, "chapters", title, { column: "subject_id", id: subjectId });
  const order_index = await nextOrderIndex(supabase, "chapters", { column: "subject_id", id: subjectId });
  const { data: chapter, error: insErr } = await supabase
    .from("chapters")
    .insert({ subject_id: subjectId, title, slug, description: src.description, order_index, is_published: false })
    .select("id")
    .single();
  if (insErr) throw new Error(insErr.message);

  const copied: string[] = [];
  try {
    await cloneResources(supabase, (src.resources ?? []) as unknown as ResRow[], chapter.id, courseId, subjectId, copied);
  } catch (e) {
    await rollbackDuplicate(supabase, "chapters", chapter.id, copied);
    throw e;
  }
  revalidatePath("/admin");
  return { kind: "chapter", id: chapter.id };
}
