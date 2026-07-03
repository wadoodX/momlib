import { createClient } from "@/lib/supabase/server";
import { signedResourceUrl } from "@/lib/storage/resources";

// Files can be up to 50 MB and are streamed through the function; give the
// transfer headroom over the platform default.
export const maxDuration = 60;

// Content types we're willing to serve *inline* from our own origin. Anything
// else (notably image/svg+xml and text/html, which can carry script) is served
// as an opaque download so an admin-uploaded file can never execute as
// same-origin script. pdf.js reads the bytes regardless of Content-Type, so the
// viewer is unaffected by this.
const INLINE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "text/plain",
]);

// Same-origin proxy for a resource's file. The PDF viewer streams through here
// instead of hitting the signed R2 URL directly, so the browser never makes a
// cross-origin request (no R2 CORS needed) and preview deploys just work.
//
// Access is enforced twice: RLS on the user's cookie client only returns a
// resource whose whole parent chain is published (admins see everything), and
// we mirror addResourceHref's paid lock so a paid file is never streamed to a
// student. This is a file-serving choke point — keep it as strict as that one.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Paid files are served to the admin (studio previews) but locked for students.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle<{ role: "admin" | "student" }>();
  const isAdmin = profile?.role === "admin";

  const { data: resource, error } = await supabase
    .from("resources")
    .select("file_path, is_paid, mime_type")
    .eq("id", id)
    .maybeSingle<{ file_path: string | null; is_paid: boolean; mime_type: string | null }>();

  if (error || !resource || !resource.file_path) {
    return new Response("Not found", { status: 404 });
  }

  if (resource.is_paid && !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = await signedResourceUrl(supabase, resource.file_path, 60 * 60);
  if (!url) {
    return new Response("Not found", { status: 404 });
  }

  // Forward the browser's Range header so pdf.js (and media players) can fetch
  // partial chunks / seek instead of pulling the whole file up front.
  const range = request.headers.get("range");
  const forwardHeaders: HeadersInit = range ? { Range: range } : {};

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: forwardHeaders,
      // Abort the upstream stream if the client disconnects, and cap the transfer.
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(55_000)]),
    });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }

  // 200 (full) and 206 (range) are both fine; anything else is an upstream error.
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  const mime = resource.mime_type ?? "";
  const inline = INLINE_TYPES.has(mime);

  const headers = new Headers();
  headers.set("Content-Type", inline ? mime : "application/octet-stream");
  headers.set("Content-Disposition", inline ? "inline" : "attachment");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "private, max-age=300");
  headers.set("Accept-Ranges", "bytes");
  // Relay length / range so partial responses are correct.
  for (const h of ["content-length", "content-range"]) {
    const value = upstream.headers.get(h);
    if (value) headers.set(h, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
