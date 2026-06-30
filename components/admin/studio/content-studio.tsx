"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, Search } from "lucide-react";
import {
  quickAdd,
  reorder,
  renameNode,
  setPublished,
  duplicateNode,
  deleteNode,
  type NodeKind,
} from "@/lib/admin/studio-actions";
import type { CourseNode, SubjectNode, ChapterNode } from "@/lib/db/admin-content";
import { TreeNav, type Selection } from "./tree-nav";
import { DetailPane } from "./detail-pane";

// Drag-to-resize bounds for the tree panel (px). Width persists in localStorage.
const MIN_NAV = 260;
const MAX_NAV = 640;
const DEFAULT_NAV = 360;
const NAV_KEY = "studio:nav-width";

export function ContentStudio({ tree: initialTree }: { tree: CourseNode[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [tree, setTree] = useState(initialTree);
  const [syncedTree, setSyncedTree] = useState(initialTree);
  const [treeQuery, setTreeQuery] = useState("");
  const [, startTransition] = useTransition();

  // Adjustable width of the tree panel. Start at the default for SSR, then adopt
  // any saved width on mount (avoids a hydration mismatch).
  const containerRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const [navWidth, setNavWidth] = useState(DEFAULT_NAV);

  useEffect(() => {
    // One-time hydration of the saved width on mount — can't run during SSR
    // without a mismatch, so it's a deliberate post-mount setState.
    const saved = Number(localStorage.getItem(NAV_KEY));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Number.isFinite(saved) && saved >= MIN_NAV && saved <= MAX_NAV) setNavWidth(saved);
  }, []);

  function startResize(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    resizingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onResize(e: React.PointerEvent<HTMLDivElement>) {
    if (!resizingRef.current || !containerRef.current) return;
    const left = containerRef.current.getBoundingClientRect().left;
    setNavWidth(Math.min(MAX_NAV, Math.max(MIN_NAV, Math.round(e.clientX - left))));
  }
  function endResize(e: React.PointerEvent<HTMLDivElement>) {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    persistNavWidth(navWidth);
  }

  function persistNavWidth(width: number) {
    try {
      localStorage.setItem(NAV_KEY, String(width));
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }

  // Keyboard support for the resize handle (arrows nudge, Home/End jump to bounds).
  function onResizeKey(e: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = navWidth - 16;
    else if (e.key === "ArrowRight") next = navWidth + 16;
    else if (e.key === "Home") next = MIN_NAV;
    else if (e.key === "End") next = MAX_NAV;
    if (next === null) return;
    e.preventDefault();
    const clamped = Math.min(MAX_NAV, Math.max(MIN_NAV, next));
    setNavWidth(clamped);
    persistNavWidth(clamped);
  }

  // Re-sync the local (optimistic) tree whenever the server sends a fresh one,
  // adjusting state during render rather than in an effect.
  if (syncedTree !== initialTree) {
    setSyncedTree(initialTree);
    setTree(initialTree);
  }

  // Selection lives in the URL so it survives reloads and is deep-linkable.
  const selection: Selection = params.get("chapter")
    ? { kind: "chapter", id: params.get("chapter")! }
    : params.get("subject")
      ? { kind: "subject", id: params.get("subject")! }
      : params.get("course")
        ? { kind: "course", id: params.get("course")! }
        : null;

  function select(kind: NodeKind, id: string) {
    const next = new URLSearchParams();
    next.set(kind, id);
    router.replace(`/admin?${next.toString()}`, { scroll: false });
  }

  function clearSelection() {
    router.replace("/admin", { scroll: false });
  }

  function onReorderCourses(items: CourseNode[]) {
    setTree(items);
    startTransition(() => void reorder("course", items.map((c) => c.id)));
  }

  function onReorderSubjects(courseId: string, items: SubjectNode[]) {
    setTree((t) => t.map((c) => (c.id === courseId ? { ...c, subjects: items } : c)));
    startTransition(() => void reorder("subject", items.map((s) => s.id)));
  }

  function onReorderChapters(subjectId: string, items: ChapterNode[]) {
    setTree((t) =>
      t.map((c) => ({
        ...c,
        subjects: c.subjects.map((s) => (s.id === subjectId ? { ...s, chapters: items } : s)),
      })),
    );
    startTransition(() => void reorder("chapter", items.map((ch) => ch.id)));
  }

  async function onQuickAdd(kind: NodeKind, parentId: string | null, title: string) {
    const { id } = await quickAdd(kind, parentId, title);
    select(kind, id);
    router.refresh();
  }

  function onRename(kind: NodeKind, id: string, title: string) {
    startTransition(async () => {
      await renameNode(kind, id, title);
      router.refresh();
    });
  }

  function onTogglePublish(kind: NodeKind, id: string, next: boolean) {
    startTransition(async () => {
      await setPublished(kind, id, next);
      router.refresh();
    });
  }

  function onDuplicate(kind: NodeKind, id: string) {
    startTransition(async () => {
      const created = await duplicateNode(kind, id);
      select(created.kind, created.id);
      router.refresh();
    });
  }

  function onDelete(kind: NodeKind, id: string) {
    if (!window.confirm(`Delete this ${kind}? Everything inside it will be removed too.`)) return;
    startTransition(async () => {
      await deleteNode(kind, id);
      if (selection?.id === id) clearSelection();
      router.refresh();
    });
  }

  const selected = findNode(tree, selection);
  const trail = nodeTrail(tree, selection);

  return (
    <div
      ref={containerRef}
      style={{ "--nav-w": `${navWidth}px` } as React.CSSProperties}
      className="grid gap-6 lg:grid-cols-[var(--nav-w)_1fr]"
    >
      <aside className="relative lg:sticky lg:top-6">
        <div className="lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto rounded-3xl border border-line bg-card p-3">
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Admin only</span>
            <span className="text-[10px] text-muted">Add · Edit · Publish</span>
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={treeQuery}
              onChange={(e) => setTreeQuery(e.target.value)}
              placeholder="Search content"
              aria-label="Search courses, subjects, and chapters"
              className="min-h-10 w-full rounded-xl border border-line bg-paper-soft pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage"
            />
          </div>
          <TreeNav
            tree={tree}
            query={treeQuery}
            selected={selection}
            onSelect={select}
            onReorderCourses={onReorderCourses}
            onReorderSubjects={onReorderSubjects}
            onReorderChapters={onReorderChapters}
            onQuickAdd={onQuickAdd}
            onRename={onRename}
            onTogglePublish={onTogglePublish}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>

        {/* Drag to resize the list (lg+). Sits in the column gap. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize list panel"
          aria-valuemin={MIN_NAV}
          aria-valuemax={MAX_NAV}
          aria-valuenow={navWidth}
          tabIndex={0}
          onPointerDown={startResize}
          onPointerMove={onResize}
          onPointerUp={endResize}
          onKeyDown={onResizeKey}
          className="group absolute -right-3 top-0 hidden h-full w-6 cursor-col-resize touch-none rounded-full focus-visible:outline-none lg:flex lg:items-center lg:justify-center"
        >
          <span className="h-10 w-1 rounded-full bg-line transition group-hover:bg-sage group-hover:h-14 group-focus-visible:h-14 group-focus-visible:bg-sage group-focus-visible:ring-2 group-focus-visible:ring-sage/40" />
        </div>
      </aside>

      <div className="min-w-0">
        {selected ? (
          <DetailPane
            key={`${selected.kind}:${selected.node.id}`}
            selected={selected}
            trail={trail}
            onDeleted={clearSelection}
          />
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper-soft/50 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-sage/10 text-sage">
              <Layers className="size-6" />
            </span>
            <p className="mt-4 text-lg font-semibold text-ink">Select something to edit</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Pick a course, subject, or chapter from the left — or type a title and press Enter to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type SelectedNode =
  | { kind: "course"; node: CourseNode }
  | { kind: "subject"; node: SubjectNode }
  | { kind: "chapter"; node: ChapterNode };

function findNode(tree: CourseNode[], selection: Selection): SelectedNode | null {
  if (!selection) return null;
  for (const course of tree) {
    if (selection.kind === "course" && course.id === selection.id) return { kind: "course", node: course };
    for (const subject of course.subjects) {
      if (selection.kind === "subject" && subject.id === selection.id) return { kind: "subject", node: subject };
      for (const chapter of subject.chapters) {
        if (selection.kind === "chapter" && chapter.id === selection.id) return { kind: "chapter", node: chapter };
      }
    }
  }
  return null;
}

// Ancestor titles for the selected node's breadcrumb: [] for a course,
// [course] for a subject, [course, subject] for a chapter.
function nodeTrail(tree: CourseNode[], selection: Selection): string[] {
  if (!selection) return [];
  for (const course of tree) {
    if (selection.kind === "course" && course.id === selection.id) return [];
    for (const subject of course.subjects) {
      if (selection.kind === "subject" && subject.id === selection.id) return [course.title];
      for (const chapter of subject.chapters) {
        if (selection.kind === "chapter" && chapter.id === selection.id) return [course.title, subject.title];
      }
    }
  }
  return [];
}
