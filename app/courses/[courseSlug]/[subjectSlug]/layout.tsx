import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  getPublishedChaptersForSubject,
  getPublishedCourseBySlug,
  getPublishedSubjectBySlug,
} from "@/lib/db/content";
import { PageShell } from "@/components/student/page-shell";
import { ChapterSidebar } from "@/components/student/chapter-sidebar";

type SubjectLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string; subjectSlug: string }>;
};

// The persistent subject frame: shell + breadcrumbs + chapter rail. The selected
// chapter's content renders as the child segment ({children}), so switching
// chapters swaps only the content pane while this layout (and the sidebar) stays.
export default async function SubjectLayout({ children, params }: SubjectLayoutProps) {
  const { profile } = await requireUser();
  const { courseSlug, subjectSlug } = await params;

  const course = await getPublishedCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const subject = await getPublishedSubjectBySlug(course.id, subjectSlug);
  if (!subject) {
    notFound();
  }

  const chapters = await getPublishedChaptersForSubject(subject.id);
  const basePath = `/courses/${course.slug}/${subject.slug}`;

  return (
    <PageShell
      eyebrow={course.title}
      title={subject.title}
      description={subject.description}
      role={profile?.role ?? "student"}
      icon={subject.icon}
      color={subject.color}
      iconKind="subject"
      breadcrumbs={[
        { label: "Courses", href: "/courses" },
        { label: course.title, href: `/courses/${course.slug}` },
        { label: subject.title },
      ]}
    >
      {chapters.length === 0 ? (
        children
      ) : (
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <ChapterSidebar chapters={chapters} basePath={basePath} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      )}
    </PageShell>
  );
}
