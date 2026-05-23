import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentForm } from "@/components/admin/content-form";
import { createCourse } from "@/lib/admin/content-actions";
import { getAdminCourses } from "@/lib/db/admin-content";

export default async function AdminPage() {
  const courses = await getAdminCourses();

  return (
    <AdminShell eyebrow="Admin" title="Teacher dashboard" description="Create and manage the course structure students will browse.">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section>
          <h2 className="text-2xl font-semibold">Courses</h2>
          <div className="mt-4 space-y-3">
            {courses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/50 p-6 text-sm text-stone-400">No courses yet.</div>
            ) : (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/courses/${course.id}`}
                  className="block rounded-3xl border border-stone-800 bg-stone-900/70 p-5 transition hover:border-emerald-300/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <span className={course.is_published ? "text-sm text-emerald-300" : "text-sm text-stone-500"}>
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-400">/{course.slug}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">New course</h2>
          <ContentForm action={createCourse} submitLabel="Create course" />
        </section>
      </div>
    </AdminShell>
  );
}
