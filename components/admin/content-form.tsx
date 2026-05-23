import type { Chapter, Course, Resource, Subject } from "@/lib/db/content";

type CommonContent = Course | Subject | Chapter;

type ContentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  hiddenFields?: Record<string, string>;
  item?: CommonContent;
};

export function ContentForm({ action, submitLabel, hiddenFields, item }: ContentFormProps) {
  return (
    <form action={action} className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)
        : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Title</span>
          <input
            required
            name="title"
            defaultValue={item?.title ?? ""}
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Slug</span>
          <input
            name="slug"
            defaultValue={item?.slug ?? ""}
            placeholder="auto-generated if blank"
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-stone-200">Description</span>
        <textarea
          name="description"
          defaultValue={item?.description ?? ""}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Order</span>
          <input
            name="order_index"
            type="number"
            defaultValue={item?.order_index ?? 0}
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
        <label className="mt-8 flex items-center gap-3 text-sm text-stone-200">
          <input name="is_published" type="checkbox" defaultChecked={item?.is_published ?? false} className="size-4 accent-emerald-300" />
          Published
        </label>
      </div>

      <button type="submit" className="mt-6 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-emerald-200">
        {submitLabel}
      </button>
    </form>
  );
}

type ResourceEditFormProps = {
  resource: Resource;
  action: (formData: FormData) => void | Promise<void>;
};

export function ResourceEditForm({ resource, action }: ResourceEditFormProps) {
  return (
    <form action={action} className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
      <input type="hidden" name="resource_id" value={resource.id} />
      <input type="hidden" name="chapter_id" value={resource.chapter_id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Title</span>
          <input
            required
            name="title"
            defaultValue={resource.title}
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-200">Order</span>
          <input
            name="order_index"
            type="number"
            defaultValue={resource.order_index}
            className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-stone-200">Description</span>
        <textarea
          name="description"
          defaultValue={resource.description ?? ""}
          rows={2}
          className="mt-2 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-50 outline-none focus:border-emerald-300"
        />
      </label>
      <label className="mt-4 flex items-center gap-3 text-sm text-stone-200">
        <input name="is_published" type="checkbox" defaultChecked={resource.is_published} className="size-4 accent-emerald-300" />
        Published
      </label>
      <button type="submit" className="mt-5 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-emerald-200">
        Save resource
      </button>
    </form>
  );
}
