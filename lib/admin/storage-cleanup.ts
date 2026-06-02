import type { createClient } from "@/lib/supabase/server";
import { removeResources } from "@/lib/storage/resources";

type Client = Awaited<ReturnType<typeof createClient>>;

export type NodeKind = "course" | "subject" | "chapter";

/** Minimal shapes for the nested selects below — only file_path is needed. */
type ResourceLite = { file_path: string | null };
type ChapterLite = { resources: ResourceLite[] | null };
type SubjectLite = { chapters: ChapterLite[] | null };
type CourseLite = { subjects: SubjectLite[] | null };
type NodeLite = CourseLite | SubjectLite | ChapterLite;

const TABLE: Record<NodeKind, "courses" | "subjects" | "chapters"> = {
  course: "courses",
  subject: "subjects",
  chapter: "chapters",
};

// Nested select that reaches every descendant resource's storage path.
const SELECT: Record<NodeKind, string> = {
  course: "id, subjects(chapters(resources(file_path)))",
  subject: "id, chapters(resources(file_path))",
  chapter: "id, resources(file_path)",
};

/**
 * Flatten a nested node row into the list of non-empty storage file paths it
 * owns (directly or via descendants). Pure — easy to unit test.
 */
export function collectResourceFilePaths(kind: NodeKind, node: NodeLite): string[] {
  const resources: ResourceLite[] = [];

  if (kind === "course") {
    for (const subject of (node as CourseLite).subjects ?? []) {
      for (const chapter of subject.chapters ?? []) {
        resources.push(...(chapter.resources ?? []));
      }
    }
  } else if (kind === "subject") {
    for (const chapter of (node as SubjectLite).chapters ?? []) {
      resources.push(...(chapter.resources ?? []));
    }
  } else {
    resources.push(...((node as ChapterLite).resources ?? []));
  }

  return resources
    .map((r) => r.file_path)
    .filter((path): path is string => typeof path === "string" && path.length > 0);
}

/**
 * Delete a course/subject/chapter and remove the Storage objects of every
 * resource underneath it. DB rows cascade on delete, but Storage does not, so
 * we gather the paths first, delete the row, then purge the files.
 *
 * Storage removal is best-effort: the DB delete is the source of truth, so a
 * failed file purge leaves orphaned bytes but never a broken tree. Throws only
 * if the row select or delete fails.
 */
export async function deleteNodeAndStorage(supabase: Client, kind: NodeKind, id: string): Promise<void> {
  const table = TABLE[kind];

  const { data, error } = await supabase.from(table).select(SELECT[kind]).eq("id", id).single();
  if (error) throw new Error(error.message);

  const paths = collectResourceFilePaths(kind, data as unknown as NodeLite);

  const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);

  await removeResources(supabase, paths);
}
