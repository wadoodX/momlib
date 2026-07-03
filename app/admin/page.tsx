import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/studio/content-studio";
import { getAdminTree } from "@/lib/db/admin-content";

export default async function AdminPage() {
  const tree = await getAdminTree();

  return (
    <AdminShell
      eyebrow="Admin"
      title="Content Studio"
      description="Build and organize your courses, subjects, chapters, and resources — all in one place."
    >
      {/* ContentStudio reads selection from useSearchParams — keep it inside a
          Suspense boundary so it doesn't force the whole route to client render. */}
      <Suspense fallback={null}>
        <ContentStudio tree={tree} />
      </Suspense>
    </AdminShell>
  );
}
