import { createFileResource, createLinkResource } from "@/lib/admin/content-actions";

type ResourceCreateFormsProps = {
  chapterId: string;
};

export function ResourceCreateForms({ chapterId }: ResourceCreateFormsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={createFileResource} className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
        <input type="hidden" name="chapter_id" value={chapterId} />
        <h2 className="text-xl font-semibold">Upload file</h2>
        <p className="mt-2 text-sm text-stone-400">PDF, PPT/PPTX, DOC/DOCX, images, and videos are supported.</p>
        <ResourceFields />
        <label className="mt-4 block">
          <span className="text-sm font-medium text-stone-200">File</span>
          <input
            required
            name="file"
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-950"
          />
        </label>
        <SubmitButton label="Upload file" />
      </form>

      <form action={createLinkResource} className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
        <input type="hidden" name="chapter_id" value={chapterId} />
        <h2 className="text-xl font-semibold">Add link</h2>
        <p className="mt-2 text-sm text-stone-400">Use this for external pages, websites, and Gamma presentations.</p>
        <ResourceFields />
        <label className="mt-4 block">
          <span className="text-sm font-medium text-stone-200">External URL</span>
          <input
            required
            name="external_url"
            type="url"
            placeholder="https://gamma.app/..."
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
        <label className="mt-4 flex items-center gap-3 text-sm text-stone-200">
          <input name="is_gamma" type="checkbox" className="size-4 accent-emerald-300" />
          This is a Gamma presentation link
        </label>
        <SubmitButton label="Add link" />
      </form>
    </div>
  );
}

function ResourceFields() {
  return (
    <>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-stone-200">Title</span>
        <input
          required
          name="title"
          className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-stone-200">Description</span>
        <textarea
          name="description"
          rows={2}
          className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
        />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Order</span>
          <input
            name="order_index"
            type="number"
            defaultValue={0}
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
        <label className="mt-8 flex items-center gap-3 text-sm text-stone-200">
          <input name="is_published" type="checkbox" className="size-4 accent-emerald-300" />
          Published
        </label>
      </div>
    </>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button type="submit" className="mt-6 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-emerald-200">
      {label}
    </button>
  );
}
