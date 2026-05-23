import { redirect } from "next/navigation";

// Superseded by the Content Studio (/admin). Kept as a redirect so older links
// still resolve to the right node.
export default async function ChapterAdminPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  redirect(`/admin?chapter=${chapterId}`);
}
