import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentForm } from "@/components/admin/content-form";
import { createChapter, deleteSubject, updateSubject } from "@/lib/admin/content-actions";
import { getAdminChapters, getAdminCourse, getAdminSubject } from "@/lib/db/admin-content";

type SubjectAdminPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectAdminPage({ params }: SubjectAdminPageProps) {
  const { subjectId } = await params;
  const subject = await getAdminSubject(subjectId);
  const course = await getAdminCourse(subject.course_id);
  const chapters = await getAdminChapters(subject.id);

  return (
    <AdminShell eyebrow={course.title} title={subject.title} description="Edit subject details and manage its chapters.">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Edit subject</h2>
            <ContentForm action={updateSubject} submitLabel="Save subject" item={subject} hiddenFields={{ subject_id: subject.id }} />
            <form action={deleteSubject} className="mt-4">
              <input type="hidden" name="subject_id" value={subject.id} />
              <input type="hidden" name="course_id" value={course.id} />
              <button type="submit" className="rounded-2xl border border-red-900/70 px-5 py-3 text-sm font-semibold text-red-300 hover:border-red-500">
                Delete subject
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Chapters</h2>
            <div className="mt-4 space-y-3">
              {chapters.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/50 p-6 text-sm text-stone-400">No chapters yet.</div>
              ) : (
                chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/admin/chapters/${chapter.id}`}
                    className="block rounded-3xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-emerald-300/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{chapter.title}</h3>
                      <span className={chapter.is_published ? "text-sm text-emerald-300" : "text-sm text-stone-500"}>
                        {chapter.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-400">/{chapter.slug}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">New chapter</h2>
          <ContentForm action={createChapter} submitLabel="Create chapter" hiddenFields={{ subject_id: subject.id }} />
        </section>
      </div>
    </AdminShell>
  );
}
