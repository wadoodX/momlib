import { redirect } from "next/navigation";

// Superseded by the Content Studio (/admin). Kept as a redirect so older links
// still resolve to the right node.
export default async function CourseAdminPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  redirect(`/admin?course=${courseId}`);
}
