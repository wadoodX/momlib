"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCourse, updateSubject, updateChapter, updateResource, deleteResource } from "@/lib/admin/content-actions";
import { deleteNode, listChapterResources, reorder, type NodeKind } from "@/lib/admin/studio-actions";
import type { Resource } from "@/lib/db/content";
import type { CourseNode, SubjectNode, ChapterNode } from "@/lib/db/admin-content";
import { ResourceForm } from "./resource-form";
import { CustomizationFields } from "./customization-fields";

type SelectedNode =
  | { kind: "course"; node: CourseNode }
  | { kind: "subject"; node: SubjectNode }
  | { kind: "chapter"; node: ChapterNode };

const KIND_LABEL: Record<NodeKind, string> = { course: "Course", subject: "Subject", chapter: "Chapter" };
const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage";

export function DetailPane({ selected, onDeleted }: { selected: SelectedNode; onDeleted: () => void }) {
  const { kind, node } = selected;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customizable = kind !== "chapter";
  const [color, setColor] = useState<string | null>("color" in node ? node.color : null);
  const [icon, setIcon] = useState<string | null>("icon" in node ? node.icon : null);

  const idField = kind === "course" ? "course_id" : kind === "subject" ? "subject_id" : "chapter_id";
  const action = kind === "course" ? updateCourse : kind === "subject" ? updateSubject : updateChapter;

  function save(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await action(formData);
        setSaved(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete this ${kind}? Everything inside it will be removed too.`)) return;
    startTransition(async () => {
      await deleteNode(kind, node.id);
      onDeleted();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{KIND_LABEL[kind]}</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">{node.title}</h2>
      </div>

      <form action={save} className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <input type="hidden" name={idField} value={node.id} />
        {/* preserve drag-set order; the editor never changes it */}
        <input type="hidden" name="order_index" value={node.order_index} />

        <label className="block">
          <span className="text-xs font-medium text-ink">Title</span>
          <input required name="title" defaultValue={node.title} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">Slug</span>
          <input name="slug" defaultValue={node.slug} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink">Description</span>
          <textarea name="description" rows={3} defaultValue={node.description ?? ""} className={inputClass} />
        </label>

        {customizable ? (
          <>
            <input type="hidden" name="color" value={color ?? ""} />
            <input type="hidden" name="icon" value={icon ?? ""} />
            <CustomizationFields color={color} icon={icon} onColor={setColor} onIcon={setIcon} />
          </>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-ink">
          <input name="is_published" type="checkbox" defaultChecked={node.is_published} className="size-4 accent-sage" />
          Published
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
          >
            Save changes
          </button>
          {saved && !pending ? <span className="text-sm text-sage-deep">Saved</span> : null}
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-red-900/40 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:border-red-500 disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </form>

      {kind === "chapter" ? <ResourcesSection chapterId={node.id} /> : null}
    </div>
  );
}

/* ---------- resources ---------- */

function ResourcesSection({ chapterId }: { chapterId: string }) {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // DetailPane is keyed per chapter in the parent, so this mounts fresh with
  // resources === null (loading) and just fetches once.
  useEffect(() => {
    let active = true;
    listChapterResources(chapterId).then((rows) => {
      if (active) setResources(rows);
    });
    return () => {
      active = false;
    };
  }, [chapterId]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !resources) return;
    const oldIndex = resources.findIndex((r) => r.id === active.id);
    const newIndex = resources.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(resources, oldIndex, newIndex);
    setResources(next);
    void reorder("resource", next.map((r) => r.id));
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-ink">Resources</h3>
      <ResourceForm chapterId={chapterId} />

      {resources === null ? (
        <p className="text-sm text-muted">Loading resources…</p>
      ) : resources.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper-soft p-5 text-sm text-muted">
          No resources yet. Add a file or link above.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={resources.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  onChanged={() => listChapterResources(chapterId).then(setResources)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function ResourceRow({ resource, onChanged }: { resource: Resource; onChanged: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id });

  function save(formData: FormData) {
    startTransition(async () => {
      await updateResource(formData);
      onChanged();
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Delete this resource?")) return;
    const formData = new FormData();
    formData.set("resource_id", resource.id);
    formData.set("chapter_id", resource.chapter_id);
    formData.set("file_path", resource.file_path ?? "");
    startTransition(async () => {
      await deleteResource(formData);
      onChanged();
      router.refresh();
    });
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-2xl border border-line bg-card p-4", isDragging && "opacity-60")}
    >
      <form ref={formRef} action={save} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab touch-none text-line active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <input type="hidden" name="resource_id" value={resource.id} />
        <input type="hidden" name="chapter_id" value={resource.chapter_id} />
        <input type="hidden" name="order_index" value={resource.order_index} />
        <input
          name="title"
          defaultValue={resource.title}
          required
          className="min-w-40 flex-1 rounded-lg border border-line bg-paper-soft px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
        <span className="rounded-full bg-paper-soft px-2.5 py-1 text-xs uppercase tracking-wide text-muted">
          {resource.resource_type}
        </span>
        {resource.external_url ? (
          <a
            href={resource.external_url}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition hover:text-gold"
            aria-label="Open link"
          >
            <ExternalLink className="size-4" />
          </a>
        ) : null}
        <label className="flex items-center gap-1.5 text-xs text-ink">
          <input name="is_published" type="checkbox" defaultChecked={resource.is_published} className="size-4 accent-sage" />
          Published
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-sage px-3 py-2 text-xs font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-red-500 transition hover:text-red-600"
          aria-label="Delete resource"
        >
          <Trash2 className="size-4" />
        </button>
      </form>
    </li>
  );
}
