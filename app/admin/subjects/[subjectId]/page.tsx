import { redirect } from "next/navigation";

// Superseded by the Content Studio (/admin). Kept as a redirect so older links
// still resolve to the right node.
export default async function SubjectAdminPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  redirect(`/admin?subject=${subjectId}`);
}
