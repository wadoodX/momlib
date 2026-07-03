import { createClient } from "@/lib/supabase/server";
import { signedResourceUrl } from "@/lib/storage/resources";

// Same-origin proxy for a resource's file. The PDF viewer streams through here
// instead of hitting the signed R2 URL directly, so the browser never makes a
// cross-origin request (no R2 CORS needed) and preview deploys just work.
//
// Access is enforced twice: RLS on the user's cookie client only returns a
// resource whose whole parent chain is published (admins see everything), and
// we mirror addResourceHref's paid lock so a paid file is never streamed to a
// student. This is a file-serving choke point — keep it as strict as that one.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": resource.mime_type || "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
