import { redirect } from "next/navigation";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

// Search now lives inline in the /courses explorer. This shim preserves any
// bookmarked /search?q=… links by redirecting them into the courses page.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  redirect(query ? `/courses?q=${encodeURIComponent(query)}` : "/courses");
}
