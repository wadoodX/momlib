"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
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

export function ContentStudio({ tree: initialTree }: { tree: CourseNode[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [tree, setTree] = useState(initialTree);
  const [syncedTree, setSyncedTree] = useState(initialTree);
  const [, startTransition] = useTransition();

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

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto rounded-3xl border border-line bg-card p-3">
        <TreeNav
          tree={tree}
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
      </aside>

      <div className="min-w-0">
        {selected ? (
          <DetailPane key={`${selected.kind}:${selected.node.id}`} selected={selected} onDeleted={clearSelection} />
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
