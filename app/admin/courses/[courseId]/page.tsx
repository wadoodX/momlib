import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentForm } from "@/components/admin/content-form";
import { createSubject, deleteCourse, updateCourse } from "@/lib/admin/content-actions";
import { getAdminCourse, getAdminSubjects } from "@/lib/db/admin-content";

type CourseAdminPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseAdminPage({ params }: CourseAdminPageProps) {
  const { courseId } = await params;
  const course = await getAdminCourse(courseId);
  const subjects = await getAdminSubjects(course.id);

  return (
    <AdminShell eyebrow="Course" title={course.title} description="Edit course details and manage its subjects.">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Edit course</h2>
            <ContentForm action={updateCourse} submitLabel="Save course" item={course} hiddenFields={{ course_id: course.id }} />
            <form action={deleteCourse} className="mt-4">
              <input type="hidden" name="course_id" value={course.id} />
              <button type="submit" className="rounded-2xl border border-red-900/70 px-5 py-3 text-sm font-semibold text-red-300 hover:border-red-500">
                Delete course
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Subjects</h2>
            <div className="mt-4 space-y-3">
              {subjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/50 p-6 text-sm text-stone-400">No subjects yet.</div>
              ) : (
                subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/admin/subjects/${subject.id}`}
                    className="block rounded-3xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-emerald-300/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{subject.title}</h3>
                      <span className={subject.is_published ? "text-sm text-emerald-300" : "text-sm text-stone-500"}>
                        {subject.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-400">/{subject.slug}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">New subject</h2>
          <ContentForm action={createSubject} submitLabel="Create subject" hiddenFields={{ course_id: course.id }} />
        </section>
      </div>
    </AdminShell>
  );
}
