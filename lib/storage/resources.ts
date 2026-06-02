import type { createClient } from "@/lib/supabase/server";
import { chunk, r2Enabled, r2Upload, r2SignedUrl, r2Remove, r2Copy } from "./r2";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "resources";
// supabase-js storage.remove() takes an array; chunk to stay well within limits.
const SUPABASE_REMOVE_BATCH = 100;

/**
 * Resource-file storage, abstracted over Cloudflare R2 and Supabase Storage.
 * When R2 is configured (`r2Enabled()`) every operation goes to R2; otherwise it
 * uses the original Supabase Storage calls, preserving today's behavior exactly.
 * `key` is the same value stored in `resources.file_path` for both backends.
 */

/** Upload a file. Throws on failure (callers clean up the DB row on error). */
export async function uploadResource(supabase: SupabaseClient, key: string, file: File): Promise<void> {
  if (r2Enabled()) {
    await r2Upload(key, file);
    return;
  }
  const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);
}

/** A short-lived signed URL for a stored file, or null if one can't be produced. */
export async function signedResourceUrl(
  supabase: SupabaseClient,
  key: string,
  expiresIn: number,
): Promise<string | null> {
  if (r2Enabled()) {
    try {
      return await r2SignedUrl(key, expiresIn);
    } catch {
      return null;
    }
  }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/** Best-effort delete of stored files. Never throws — the DB row is the source of
 *  truth, so orphaned bytes are tolerated rather than blocking a delete. */
export async function removeResources(supabase: SupabaseClient, keys: string[]): Promise<void> {
  const paths = keys.filter(Boolean);
  if (paths.length === 0) return;
  try {
    if (r2Enabled()) {
      await r2Remove(paths);
      return;
    }
    for (const batch of chunk(paths, SUPABASE_REMOVE_BATCH)) {
      await supabase.storage.from(BUCKET).remove(batch);
    }
  } catch (error) {
    // Best-effort: leave orphaned bytes rather than fail the delete, but surface
    // the failure so orphans can be reconciled.
    console.error(`Failed to remove resource files (${paths.length}):`, error);
  }
}

/** Server-side copy of a stored file (used when duplicating content). Throws on failure. */
export async function copyResource(supabase: SupabaseClient, from: string, to: string): Promise<void> {
  if (r2Enabled()) {
    await r2Copy(from, to);
    return;
  }
  const { error } = await supabase.storage.from(BUCKET).copy(from, to);
  if (error) throw new Error(error.message);
}
