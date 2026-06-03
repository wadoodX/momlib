"use client";

import { useEffect, useState, useRef, useTransition, type ReactNode } from "react";
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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Plus, Pencil, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { CourseNode, SubjectNode, ChapterNode } from "@/lib/db/admin-content";
import type { NodeKind } from "@/lib/admin/studio-actions";
import { NodeIcon } from "@/components/customization/node-icon";

export type Selection = { kind: NodeKind; id: string } | null;

type Ctx = {
  selected: Selection;
  onSelect: (kind: NodeKind, id: string) => void;
  onReorderCourses: (items: CourseNode[]) => void;
  onReorderSubjects: (courseId: string, items: SubjectNode[]) => void;
  onReorderChapters: (subjectId: string, items: ChapterNode[]) => void;
  onQuickAdd: (kind: NodeKind, parentId: string | null, title: string) => Promise<void>;
  onRename: (kind: NodeKind, id: string, title: string) => void;
  onTogglePublish: (kind: NodeKind, id: string, next: boolean) => void;
  onDuplicate: (kind: NodeKind, id: string) => void;
  onDelete: (kind: NodeKind, id: string) => void;
  // expansion + add-child focus
  isCollapsed: (id: string) => boolean;
  toggle: (id: string) => void;
  focusParent: string | null;
  setFocusParent: (id: string | null) => void;
  requestAddChild: (parentId: string) => void;
};

export function TreeNav({
  tree,
  ...rest
}: { tree: CourseNode[] } & Omit<Ctx, "isCollapsed" | "toggle" | "focusParent" | "setFocusParent" | "requestAddChild">) {
  // Start fully collapsed: only top-level courses are visible on load.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    for (const course of tree) {
      ids.add(course.id);
      for (const subject of course.subjects) ids.add(subject.id);
    }
    return ids;
  });
  const [focusParent, setFocusParent] = useState<string | null>(null);

  const ctx: Ctx = {
    ...rest,
    isCollapsed: (id) => collapsed.has(id),
    toggle: (id) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    focusParent,
    setFocusParent,
    requestAddChild: (parentId) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        next.delete(parentId); // ensure expanded
        return next;
      });
      setFocusParent(parentId);
    },
  };

  return (
    <div className="space-y-1">
      <SortableGroup items={tree} onReorder={ctx.onReorderCourses}>
        {(course) => <CourseRow key={course.id} course={course} ctx={ctx} />}
      </SortableGroup>
      <QuickAddRow kind="course" parentId={null} indent={0} ctx={ctx} label="Add course" />
    </div>
  );
}

function CourseRow({ course, ctx }: { course: CourseNode; ctx: Ctx }) {
  const open = !ctx.isCollapsed(course.id);
  return (
    <div>
      <Row kind="course" node={course} depth={0} open={open} ctx={ctx} />
      {open ? (
        <div className="mt-1 space-y-1">
          <SortableGroup items={course.subjects} onReorder={(items) => ctx.onReorderSubjects(course.id, items)}>
            {(subject) => <SubjectRow key={subject.id} subject={subject} ctx={ctx} />}
          </SortableGroup>
          <QuickAddRow kind="subject" parentId={course.id} indent={1} ctx={ctx} label="Add subject" />
        </div>
      ) : null}
    </div>
  );
}

function SubjectRow({ subject, ctx }: { subject: SubjectNode; ctx: Ctx }) {
  const open = !ctx.isCollapsed(subject.id);
  return (
    <div>
      <Row kind="subject" node={subject} depth={1} open={open} ctx={ctx} />
      {open ? (
        <div className="mt-1 space-y-1">
          <SortableGroup items={subject.chapters} onReorder={(items) => ctx.onReorderChapters(subject.id, items)}>
            {(chapter) => <Row key={chapter.id} kind="chapter" node={chapter} depth={2} ctx={ctx} />}
          </SortableGroup>
          <QuickAddRow kind="chapter" parentId={subject.id} indent={2} ctx={ctx} label="Add chapter" />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- generic sortable group ---------- */

function SortableGroup<T extends { id: string }>({
  items,
  onReorder,
  children,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (item: T) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => children(item))}
      </SortableContext>
    </DndContext>
  );
}

const DEPTH_PAD = ["pl-2", "pl-7", "pl-12"] as const;

type RowNode = { id: string; title: string; is_published: boolean; color?: string | null; icon?: string | null };

function Row({
  kind,
  node,
  depth,
  open,
  ctx,
}: {
  kind: NodeKind;
  node: RowNode;
  depth: 0 | 1 | 2;
  open?: boolean;
  ctx: Ctx;
}) {
  const hasChildren = kind !== "chapter";
  const active = ctx.selected?.kind === kind && ctx.selected.id === node.id;

  const [editing, setEditing] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: editing,
  });

  useEffect(() => {
    if (editing) renameRef.current?.select();
  }, [editing]);

  function commitRename(value: string) {
    setEditing(false);
    const title = value.trim();
    if (title && title !== node.title) ctx.onRename(kind, node.id, title);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          className={cn(
            "group flex items-center gap-1 rounded-xl pr-2 transition-colors",
            DEPTH_PAD[depth],
            active ? "bg-sage/15" : "hover:bg-paper-soft",
            isDragging && "opacity-60",
          )}
        >
          {!editing ? (
            <button
              type="button"
              aria-label="Drag to reorder"
              className="cursor-grab touch-none text-line opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
          ) : (
            <span className="w-4" />
          )}

          {hasChildren ? (
            <button type="button" onClick={() => ctx.toggle(node.id)} aria-label={open ? "Collapse" : "Expand"} className="text-muted">
              <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
            </button>
          ) : (
            <span className="w-4" />
          )}

          {kind !== "chapter" ? (
            <NodeIcon icon={node.icon} color={node.color} kind={kind} size="sm" />
          ) : null}

          {editing ? (
            <input
              ref={renameRef}
              defaultValue={node.title}
              onBlur={(e) => commitRename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename((e.target as HTMLInputElement).value);
                } else if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
              className="my-1 w-full rounded-lg border border-sage bg-paper-soft px-2 py-1 text-[15px] text-ink outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => ctx.onSelect(kind, node.id)}
              title={node.title}
              className={cn(
                "flex flex-1 items-center gap-2 truncate py-2 text-left text-[15px] leading-snug",
                active ? "font-semibold text-ink" : "text-ink/90",
              )}
            >
              <span className="truncate">{node.title}</span>
              {!node.is_published ? (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">Draft</span>
              ) : null}
            </button>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setTimeout(() => setEditing(true), 0)}>
          <Pencil />
          Rename
        </ContextMenuItem>
        {kind === "course" ? (
          <ContextMenuItem onSelect={() => ctx.requestAddChild(node.id)}>
            <Plus />
            Add subject
          </ContextMenuItem>
        ) : null}
        {kind === "subject" ? (
          <ContextMenuItem onSelect={() => ctx.requestAddChild(node.id)}>
            <Plus />
            Add chapter
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem onSelect={() => ctx.onTogglePublish(kind, node.id, !node.is_published)}>
          {node.is_published ? <EyeOff /> : <Eye />}
          {node.is_published ? "Unpublish" : "Publish"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => ctx.onDuplicate(kind, node.id)}>
          <Copy />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive onSelect={() => ctx.onDelete(kind, node.id)}>
          <Trash2 />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function QuickAddRow({
  kind,
  parentId,
  indent,
  label,
  ctx,
}: {
  kind: NodeKind;
  parentId: string | null;
  indent: 0 | 1 | 2;
  label: string;
  ctx: Ctx;
}) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // When "Add child" targets this parent, focus its input.
  useEffect(() => {
    if (ctx.focusParent === parentId && parentId !== null) {
      inputRef.current?.focus();
    }
  }, [ctx.focusParent, parentId]);

  function add() {
    const title = value.trim();
    if (!title || pending) return;
    startTransition(async () => {
      await ctx.onQuickAdd(kind, parentId, title);
      setValue("");
      inputRef.current?.focus();
    });
  }

  return (
    <div className={cn("flex items-center gap-1 pr-2", DEPTH_PAD[indent])}>
      <button
        type="button"
        onClick={add}
        disabled={!value.trim() || pending}
        aria-label={label}
        className="shrink-0 rounded-md p-0.5 text-muted transition hover:bg-sage/15 hover:text-sage disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
      >
        <Plus className="size-4" />
      </button>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          if (ctx.focusParent === parentId) ctx.setFocusParent(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={label}
        disabled={pending}
        className="w-full rounded-lg bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-muted focus:bg-paper-soft focus:px-2"
      />
    </div>
  );
}
