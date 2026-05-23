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
      <ContentStudio tree={tree} />
    </AdminShell>
  );
}
