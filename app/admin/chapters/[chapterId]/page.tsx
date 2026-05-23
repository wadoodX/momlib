import { AdminShell } from "@/components/admin/admin-shell";
import { ContentForm, ResourceEditForm } from "@/components/admin/content-form";
import { ResourceCreateForms } from "@/components/admin/resource-create-forms";
import { deleteChapter, deleteResource, updateChapter, updateResource } from "@/lib/admin/content-actions";
import { getAdminChapter, getAdminCourse, getAdminResources, getAdminSubject } from "@/lib/db/admin-content";

type ChapterAdminPageProps = {
  params: Promise<{ chapterId: string }>;
};

export default async function ChapterAdminPage({ params }: ChapterAdminPageProps) {
  const { chapterId } = await params;
  const chapter = await getAdminChapter(chapterId);
  const subject = await getAdminSubject(chapter.subject_id);
  const course = await getAdminCourse(subject.course_id);
  const resources = await getAdminResources(chapter.id);

  return (
    <AdminShell eyebrow={`${course.title} / ${subject.title}`} title={chapter.title} description="Edit chapter details and manage resources.">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Edit chapter</h2>
          <ContentForm action={updateChapter} submitLabel="Save chapter" item={chapter} hiddenFields={{ chapter_id: chapter.id }} />
          <form action={deleteChapter} className="mt-4">
            <input type="hidden" name="chapter_id" value={chapter.id} />
            <input type="hidden" name="subject_id" value={subject.id} />
            <button type="submit" className="rounded-2xl border border-red-900/70 px-5 py-3 text-sm font-semibold text-red-300 hover:border-red-500">
              Delete chapter
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Add resources</h2>
          <ResourceCreateForms chapterId={chapter.id} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Resources</h2>
          <div className="mt-4 space-y-4">
            {resources.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/50 p-6 text-sm text-stone-400">No resources yet.</div>
            ) : (
              resources.map((resource) => (
                <article key={resource.id} className="space-y-3 rounded-3xl border border-stone-800 bg-stone-950/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-400">
                    <span>{resource.resource_type}</span>
                    <span>{resource.is_published ? "Published" : "Draft"}</span>
                  </div>
                  <ResourceEditForm resource={resource} action={updateResource} />
                  <form action={deleteResource}>
                    <input type="hidden" name="resource_id" value={resource.id} />
                    <input type="hidden" name="chapter_id" value={chapter.id} />
                    <input type="hidden" name="file_path" value={resource.file_path ?? ""} />
                    <button type="submit" className="rounded-2xl border border-red-900/70 px-5 py-3 text-sm font-semibold text-red-300 hover:border-red-500">
                      Delete resource
                    </button>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
