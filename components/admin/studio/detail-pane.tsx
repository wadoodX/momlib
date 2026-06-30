"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCourse, updateSubject, updateChapter, updateResource, deleteResource } from "@/lib/admin/content-actions";
import { deleteNode, listChapterResources, reorder, setPublished, type NodeKind } from "@/lib/admin/studio-actions";
import { RESOURCE_CATEGORIES, categoryMeta, resourceTypeLabel } from "@/lib/resource-meta";
import type { Resource } from "@/lib/db/content";
import type { CourseNode, SubjectNode, ChapterNode } from "@/lib/db/admin-content";
import { ResourceForm } from "./resource-form";
import { CustomizationFields } from "./customization-fields";
import { AccessFields } from "./access-fields";

// Local copy of the gamma host check (the one in content-actions lives in a
// "use server" module and can't be imported into a client component).
function isGammaUrl(value: string | null) {
  if (!value) return false;
  try {
    const h = new URL(value).hostname;
    return h === "gamma.app" || h.endsWith(".gamma.app");
  } catch {
    return false;
  }
}

// Human meta line for an admin resource card, e.g. "Notes · PDF · free".
function accessLabel(resource: Resource): string {
  if (resource.is_paid) return "paid → Payhip";
  if (isGammaUrl(resource.external_url)) return "Gamma";
  return "free";
}

type SelectedNode =
  | { kind: "course"; node: CourseNode }
  | { kind: "subject"; node: SubjectNode }
  | { kind: "chapter"; node: ChapterNode };

const KIND_LABEL: Record<NodeKind, string> = { course: "Course", subject: "Subject", chapter: "Chapter" };
const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage";

export function DetailPane({
  selected,
  trail = [],
  onDeleted,
}: {
  selected: SelectedNode;
  trail?: string[];
  onDeleted: () => void;
}) {
  // Chapters get the simple, student-like view (header + resources); courses and
  // subjects keep the settings form (they carry slug + color/icon).
  if (selected.kind === "chapter") {
    return <ChapterDetail node={selected.node} trail={trail} onDeleted={onDeleted} />;
  }
  return <NodeSettings selected={selected} onDeleted={onDeleted} />;
}

function NodeSettings({ selected, onDeleted }: { selected: SelectedNode; onDeleted: () => void }) {
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

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:border-destructive disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- chapter: clean header + resources ---------- */

function ChapterDetail({
  node,
  trail,
  onDeleted,
}: {
  node: ChapterNode;
  trail: string[];
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateChapter(formData);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  function togglePublish() {
    startTransition(async () => {
      await setPublished("chapter", node.id, !node.is_published);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Delete this chapter? Everything inside it will be removed too.")) return;
    startTransition(async () => {
      await deleteNode("chapter", node.id);
      onDeleted();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Read-only header — breadcrumb, title, subtitle — with quiet actions. */}
      <div>
        {trail.length > 0 ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{trail.join(" / ")}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{node.title}</h2>
            {node.description ? <p className="mt-1 text-sm leading-6 text-muted">{node.description}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={togglePublish}
              disabled={pending}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60",
                node.is_published
                  ? "border-sage/40 bg-sage/10 text-sage-deep"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {node.is_published ? "Published" : "Draft"}
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-label="Edit details"
              className="rounded-lg border border-line p-2 text-muted transition hover:text-ink"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label="Delete chapter"
              className="rounded-lg border border-line p-2 text-muted transition hover:border-destructive hover:text-destructive disabled:opacity-60"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit details — collapsed by default so the default view stays simple. */}
      {editing ? (
        <form action={save} className="space-y-3 rounded-2xl border border-line bg-card p-5">
          <input type="hidden" name="chapter_id" value={node.id} />
          <input type="hidden" name="order_index" value={node.order_index} />
          <label className="block">
            <span className="text-xs font-medium text-ink">Title</span>
            <input required name="title" defaultValue={node.title} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Subtitle</span>
            <input
              name="description"
              defaultValue={node.description ?? ""}
              placeholder="e.g. Hadith 680–710 · etiquette of companionship"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink">Slug</span>
            <input name="slug" defaultValue={node.slug} className={inputClass} />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-sage px-4 py-2 text-xs font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted transition hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ResourcesSection chapterId={node.id} />
    </div>
  );
}

/* ---------- resources ---------- */

function ResourcesSection({ chapterId }: { chapterId: string }) {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Tracks the latest reorder write so a card's onChanged refetch doesn't land
  // before it commits and briefly revert the visual order.
  const reorderRef = useRef<Promise<unknown>>(Promise.resolve());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  async function refetch() {
    await reorderRef.current; // don't clobber an in-flight reorder
    setResources(await listChapterResources(chapterId));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !resources) return;
    const oldIndex = resources.findIndex((r) => r.id === active.id);
    const newIndex = resources.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(resources, oldIndex, newIndex);
    setResources(next);
    reorderRef.current = reorder("resource", next.map((r) => r.id)).catch((e) => {
      console.error("Failed to persist resource order:", e);
    });
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Resources</h3>

      {resources === null ? (
        <p className="text-sm text-muted">Loading resources…</p>
      ) : resources.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper-soft p-5 text-sm text-muted">
          No resources yet. Add a file or link below.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={resources.map((r) => r.id)} strategy={rectSortingStrategy}>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <ResourceCardItem
                  key={resource.id}
                  resource={resource}
                  selected={selectedId === resource.id}
                  onSelect={() => setSelectedId((id) => (id === resource.id ? null : resource.id))}
                  onChanged={refetch}
                  onDeleted={() => {
                    setSelectedId((id) => (id === resource.id ? null : id));
                    refetch();
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <ResourceForm chapterId={chapterId} onAdded={refetch} />
    </section>
  );
}

function ResourceCardItem({
  resource,
  selected,
  onSelect,
  onChanged,
  onDeleted,
}: {
  resource: Resource;
  selected: boolean;
  onSelect: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id });
  const meta = categoryMeta(resource.category);
  const Icon = meta.icon;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-2xl border bg-card p-4 transition",
        selected ? "border-sage ring-2 ring-sage" : "border-line",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="mt-0.5 cursor-grab touch-none text-line active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            resource.is_paid ? "bg-gold/15 text-gold" : "bg-sage/15 text-sage-deep",
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-semibold text-ink">{resource.title}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {meta.label} · {resourceTypeLabel(resource.resource_type)} · {accessLabel(resource)}
          </span>
        </button>
        {!resource.is_published ? (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">Draft</span>
        ) : null}
      </div>

      {selected ? <ResourceEditor resource={resource} onChanged={onChanged} onDeleted={onDeleted} /> : null}
    </li>
  );
}

function ResourceEditor({
  resource,
  onChanged,
  onDeleted,
}: {
  resource: Resource;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paid, setPaid] = useState(resource.is_paid);
  const [error, setError] = useState<string | null>(null);

  function save(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateResource(formData);
        onChanged();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
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
      onDeleted();
      router.refresh();
    });
  }

  return (
    <form action={save} className="mt-4 space-y-3 border-t border-line pt-4">
      <input type="hidden" name="resource_id" value={resource.id} />
      <input type="hidden" name="chapter_id" value={resource.chapter_id} />
      <input type="hidden" name="order_index" value={resource.order_index} />

      <label className="block">
        <span className="text-xs font-medium text-ink">Title</span>
        <input required name="title" defaultValue={resource.title} className={inputClass} />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-ink">
          Description <span className="text-muted">(optional)</span>
        </span>
        <textarea name="description" rows={2} defaultValue={resource.description ?? ""} className={inputClass} />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-ink">Type</span>
        <select name="category" defaultValue={resource.category ?? ""} className={inputClass}>
          <option value="">— none —</option>
          {RESOURCE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <AccessFields
        paid={paid}
        onPaid={setPaid}
        defaultPayhipUrl={resource.payhip_url ?? ""}
      />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="is_published" type="checkbox" defaultChecked={resource.is_published} className="size-4 accent-sage" />
        Published
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-sage px-4 py-2 text-xs font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-destructive transition hover:text-destructive/80"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>
    </form>
  );
}
