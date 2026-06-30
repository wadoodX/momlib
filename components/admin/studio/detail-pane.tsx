"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Upload, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateCourse,
  updateSubject,
  updateChapter,
  updateResource,
  deleteResource,
  createFileResource,
  createLinkResource,
} from "@/lib/admin/content-actions";
import { deleteNode, listChapterResources, setPublished, type NodeKind } from "@/lib/admin/studio-actions";
import { categoryMeta, resourceTypeLabel, type ResourceCategory } from "@/lib/resource-meta";
import type { Resource } from "@/lib/db/content";
import type { CourseNode, SubjectNode, ChapterNode } from "@/lib/db/admin-content";
import { CustomizationFields } from "./customization-fields";
import { AccessFields } from "./access-fields";

// The fixed set of resource boxes every chapter shows (the wireframe's 6).
const RESOURCE_SLOTS: { category: ResourceCategory; name: string }[] = [
  { category: "notes", name: "Lesson notes" },
  { category: "slides", name: "Slide deck" },
  { category: "quiz", name: "Quiz" },
  { category: "question_bank", name: "Question bank" },
  { category: "worksheet", name: "Worksheet" },
  { category: "audio", name: "NotebookLM" },
];

const FILE_ACCEPT = ".pdf,.ppt,.pptx,.doc,.docx,image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm";
const fileInputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition focus:border-sage file:mr-3 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-paper";

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

/* ---------- resources: a fixed grid of 6 boxes per chapter ---------- */

// The set of box categories, for quick membership checks.
const SLOT_CATEGORIES = new Set<ResourceCategory>(RESOURCE_SLOTS.map((s) => s.category));

type Selected = { kind: "type"; category: ResourceCategory } | { kind: "resource"; id: string };

function ResourcesSection({ chapterId }: { chapterId: string }) {
  const [resources, setResources] = useState<Resource[] | null>(null);
  // What the always-visible panel acts on: a type box (to add to it) or a
  // specific resource (to edit). Defaults to the first type so adding is ready.
  const [selected, setSelected] = useState<Selected>({ kind: "type", category: RESOURCE_SLOTS[0].category });

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
    setResources(await listChapterResources(chapterId));
  }

  if (resources === null) {
    return <p className="text-sm text-muted">Loading resources…</p>;
  }

  // Group resources under their type box. Anything with no/other category shows
  // under "Other resources" so existing/legacy content is never hidden.
  const byCategory = new Map<ResourceCategory, Resource[]>();
  for (const slot of RESOURCE_SLOTS) byCategory.set(slot.category, []);
  const others: Resource[] = [];
  for (const r of resources) {
    const cat = r.category as ResourceCategory | null;
    if (cat && SLOT_CATEGORIES.has(cat)) byCategory.get(cat)!.push(r);
    else others.push(r);
  }

  const selectedResource = selected.kind === "resource" ? resources.find((r) => r.id === selected.id) ?? null : null;
  const selectedSlot = selected.kind === "type" ? RESOURCE_SLOTS.find((s) => s.category === selected.category)! : null;

  return (
    <section className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Resources</h3>

      {/* Fixed type boxes. Each lists its named resources; "Add to …" targets it. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {RESOURCE_SLOTS.map((slot) => (
          <TypeBox
            key={slot.category}
            slot={slot}
            resources={byCategory.get(slot.category)!}
            isAddTarget={selected.kind === "type" && selected.category === slot.category}
            selectedResourceId={selected.kind === "resource" ? selected.id : null}
            onAddTo={() => setSelected({ kind: "type", category: slot.category })}
            onSelectResource={(id) => setSelected({ kind: "resource", id })}
          />
        ))}
      </div>

      {/* Always-available add / edit panel for the current selection. */}
      <ResourcePanel
        chapterId={chapterId}
        slot={selectedSlot}
        resource={selectedResource}
        nextOrderIndex={resources.length}
        onChanged={refetch}
      />

      {others.length > 0 ? (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">Other resources</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {others.map((r) => (
              <OtherResourceItem
                key={r.id}
                resource={r}
                selected={selected.kind === "resource" && selected.id === r.id}
                onSelect={() => setSelected({ kind: "resource", id: r.id })}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

// Renders the right form for the selection: Add (a type box is selected) or
// Edit (a resource is selected). Always rendered below the boxes.
function ResourcePanel({
  chapterId,
  slot,
  resource,
  nextOrderIndex,
  onChanged,
}: {
  chapterId: string;
  slot: { category: ResourceCategory; name: string } | null;
  resource: Resource | null;
  nextOrderIndex: number;
  onChanged: () => void;
}) {
  if (resource) {
    return <EditPanel key={resource.id} resource={resource} onChanged={onChanged} />;
  }
  if (slot) {
    return <AddPanel key={`add:${slot.category}`} chapterId={chapterId} slot={slot} orderIndex={nextOrderIndex} onChanged={onChanged} />;
  }
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper-soft/50 p-5 text-sm text-muted">
      Select a box above to add a resource.
    </div>
  );
}

// A fixed type box: its label never changes. Lists the named resources of that
// type and an "Add to …" action; clicking a resource selects it for editing.
function TypeBox({
  slot,
  resources,
  isAddTarget,
  selectedResourceId,
  onAddTo,
  onSelectResource,
}: {
  slot: { category: ResourceCategory; name: string };
  resources: Resource[];
  isAddTarget: boolean;
  selectedResourceId: string | null;
  onAddTo: () => void;
  onSelectResource: (id: string) => void;
}) {
  const Icon = categoryMeta(slot.category).icon;
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-4 transition",
        isAddTarget ? "border-sage ring-2 ring-sage" : "border-line",
      )}
    >
      {/* The whole header is clickable to select this type (so the panel below
          targets it). Resource rows below are separate buttons (siblings). */}
      <button type="button" onClick={onAddTo} className="flex w-full items-center gap-2 text-left">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sage/15 text-sage-deep">
          <Icon className="size-4.5" />
        </span>
        {/* Fixed type name — never replaced by a resource's name. */}
        <span className="font-semibold text-ink">{slot.name}</span>
        {resources.length > 0 ? <span className="ml-auto text-xs text-muted">{resources.length}</span> : null}
      </button>

      {resources.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {resources.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelectResource(r.id)}
                aria-pressed={selectedResourceId === r.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                  selectedResourceId === r.id ? "bg-sage/10 text-ink" : "text-ink/90 hover:bg-paper-soft",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{r.title}</span>
                {!r.is_published ? (
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">Draft</span>
                ) : null}
                <span className="shrink-0 text-[10px] text-muted">{r.is_paid ? "Paid" : resourceTypeLabel(r.resource_type)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted">Empty</p>
      )}

      <button
        type="button"
        onClick={onAddTo}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sage transition hover:text-sage-deep"
      >
        <Plus className="size-3.5" /> Add to {slot.name}
      </button>
    </div>
  );
}

// The always-visible "Add resource" panel, targeting the selected type box.
function AddPanel({
  chapterId,
  slot,
  orderIndex,
  onChanged,
}: {
  chapterId: string;
  slot: { category: ResourceCategory; name: string };
  orderIndex: number;
  onChanged: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "file") {
          await createFileResource(formData);
        } else {
          await createLinkResource(formData);
        }
        // Reset so the next item of this type can be added cleanly.
        formRef.current?.reset();
        setPaid(false);
        onChanged();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add the resource.");
      }
    });
  }

  return (
    <form ref={formRef} action={submit} className="space-y-3 rounded-2xl border border-dashed border-line bg-paper-soft/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Add to {slot.name}</p>
      <input type="hidden" name="chapter_id" value={chapterId} />
      <input type="hidden" name="category" value={slot.category} />
      <input type="hidden" name="order_index" value={orderIndex} />

      <div className="inline-grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper-soft p-1">
        {(["file", "link"] as const).map((m) => {
          const Icon = m === "file" ? Upload : Link2;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                mode === m ? "bg-sage text-paper" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-3.5" />
              {m === "file" ? "Upload file" : "Add link"}
            </button>
          );
        })}
      </div>

      {mode === "file" ? (
        <label className="block">
          <span className="text-xs font-medium text-ink">File</span>
          <input required name="file" type="file" accept={FILE_ACCEPT} className={fileInputClass} />
        </label>
      ) : (
        <>
          <label className="block">
            <span className="text-xs font-medium text-ink">Link</span>
            <input required name="external_url" type="url" placeholder="https://…" className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="is_gamma" type="checkbox" className="size-4 accent-sage" />
            Gamma presentation
          </label>
        </>
      )}

      <label className="block">
        <span className="text-xs font-medium text-ink">Name</span>
        <input required name="title" placeholder={`e.g. ${slot.name} — week 1`} className={inputClass} />
      </label>

      <AccessFields paid={paid} onPaid={setPaid} />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="is_published" type="checkbox" defaultChecked className="size-4 accent-sage" />
        Published
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-sage px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add resource"}
      </button>
    </form>
  );
}

// The always-visible panel when a resource is selected: edit its name, which
// type box it's in, access, and published — or remove it. The file/link itself
// is changed by removing and re-adding.
function EditPanel({ resource, onChanged }: { resource: Resource; onChanged: () => void }) {
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
    if (!window.confirm("Remove this resource?")) return;
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
    <form action={save} className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Edit resource</p>
      <input type="hidden" name="resource_id" value={resource.id} />
      <input type="hidden" name="chapter_id" value={resource.chapter_id} />
      <input type="hidden" name="order_index" value={resource.order_index} />
      {/* preserve description on edit */}
      <input type="hidden" name="description" value={resource.description ?? ""} />

      <label className="block">
        <span className="text-xs font-medium text-ink">Name</span>
        <input required name="title" defaultValue={resource.title} className={inputClass} />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-ink">Type box</span>
        <select name="category" defaultValue={resource.category ?? ""} className={inputClass}>
          <option value="">— none (Other) —</option>
          {RESOURCE_SLOTS.map((s) => (
            <option key={s.category} value={s.category}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <AccessFields paid={paid} onPaid={setPaid} defaultPayhipUrl={resource.payhip_url ?? ""} />

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
          Remove
        </button>
      </div>
    </form>
  );
}

// A leftover resource that doesn't fit one of the 6 boxes (uncategorized/legacy
// or a duplicate). Selecting it loads it into the panel above for editing — no
// form opens inside the card.
function OtherResourceItem({
  resource,
  selected,
  onSelect,
}: {
  resource: Resource;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = categoryMeta(resource.category).icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition",
        selected ? "border-sage ring-2 ring-sage" : "border-line hover:border-sage",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-paper-soft text-muted">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{resource.title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">
          {resourceTypeLabel(resource.resource_type)} · {accessLabel(resource)}
        </span>
      </span>
      {!resource.is_published ? (
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">Draft</span>
      ) : null}
    </button>
  );
}
