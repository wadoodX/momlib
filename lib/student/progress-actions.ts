"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Toggle a chapter's completion for the current student. Upserts the user's
// chapter_views row, setting completed_at to now (done) or null (undone). Only
// `completed_at` + `viewed_at` are written, so it never disturbs another user's
// row (RLS scopes writes to auth.uid()). Revalidates the dashboard so its
// progress reflects the change on next view.
export async function setChapterCompleted(chapterId: string, completed: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update progress.");
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("chapter_views").upsert(
    {
      user_id: user.id,
      chapter_id: chapterId,
      viewed_at: now,
      completed_at: completed ? now : null,
    },
    { onConflict: "user_id,chapter_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
