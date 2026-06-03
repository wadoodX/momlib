import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;
type Scoped = "courses" | "subjects" | "chapters";

export function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

/**
 * Returns a slug unique within its scope, appending -2, -3, … on collision.
 * Courses are globally unique; subjects/chapters are unique per parent.
 */
export async function uniqueSlug(
  supabase: Client,
  table: Scoped,
  base: string,
  scope?: { column: "course_id" | "subject_id"; id: string },
): Promise<string> {
  const root = slugify(base);

  // Match only the exact root or its numbered variants (root-2, root-3, …) so a
  // longer sibling slug (e.g. "introduction" when root is "intro") doesn't get
  // counted as taken. slugify() limits root to [a-z0-9-], safe in an or() filter.
  let query = supabase.from(table).select("slug").or(`slug.eq.${root},slug.like.${root}-*`);
  if (scope) {
    // `table` is a union, so eq()'s column type narrows to the shared columns;
    // the scoped FK column is valid for the concrete table at each call site.
    query = query.eq(scope.column as never, scope.id);
  }
  const { data } = await query;
  const taken = new Set((data ?? []).map((row) => (row as { slug: string }).slug));

  if (!taken.has(root)) return root;
  for (let i = 2; ; i += 1) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Next order_index for a sibling group, so new items append at the end. */
export async function nextOrderIndex(
  supabase: Client,
  table: "courses" | "subjects" | "chapters" | "resources",
  scope?: { column: "course_id" | "subject_id" | "chapter_id"; id: string },
): Promise<number> {
  let query = supabase.from(table).select("order_index").order("order_index", { ascending: false }).limit(1);
  if (scope) {
    query = query.eq(scope.column as never, scope.id);
  }
  const { data } = await query;
  const max = (data?.[0] as { order_index: number } | undefined)?.order_index;
  return typeof max === "number" ? max + 1 : 0;
}
