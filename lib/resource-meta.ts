import {
  FileText,
  Presentation,
  ListChecks,
  FileQuestion,
  PencilRuler,
  Headphones,
  Link2,
  FileType,
  File,
  type LucideIcon,
} from "lucide-react";
import type { Resource } from "@/lib/db/content";

/**
 * Manual resource "category" — a pedagogical label the admin picks (drives the
 * card chip + badge). Independent of the auto-detected `resource_type` (file
 * format: pdf/ppt/doc/image/link/video), which still drives the student preview.
 * Single source of truth for the add-form, the admin cards, and the student card.
 */
export type ResourceCategory =
  | "notes"
  | "slides"
  | "quiz"
  | "question_bank"
  | "worksheet"
  | "audio"
  | "link"
  | "document"
  | "other";

export const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string; icon: LucideIcon }[] = [
  { value: "notes", label: "Notes", icon: FileText },
  { value: "slides", label: "Slides", icon: Presentation },
  { value: "quiz", label: "Quiz", icon: ListChecks },
  { value: "question_bank", label: "Question bank", icon: FileQuestion },
  { value: "worksheet", label: "Worksheet", icon: PencilRuler },
  { value: "audio", label: "NotebookLM", icon: Headphones },
  { value: "link", label: "Link", icon: Link2 },
  { value: "document", label: "Document", icon: FileType },
  { value: "other", label: "Other", icon: File },
];

const BY_VALUE = new Map(RESOURCE_CATEGORIES.map((c) => [c.value, c] as const));

export function isCategory(value: string | null | undefined): value is ResourceCategory {
  return !!value && BY_VALUE.has(value as ResourceCategory);
}

/** Resolve a (possibly null/unknown) category to its meta, falling back to "Other". */
export function categoryMeta(value: string | null | undefined) {
  return (isCategory(value) ? BY_VALUE.get(value) : undefined) ?? BY_VALUE.get("other")!;
}

/** Short uppercase label for the auto-detected file format, shown on the card meta line. */
const TYPE_LABEL: Record<Resource["resource_type"], string> = {
  pdf: "PDF",
  ppt: "PPTX",
  doc: "DOC",
  image: "Image",
  link: "Link",
  video: "Video",
};

export function resourceTypeLabel(type: Resource["resource_type"]): string {
  return TYPE_LABEL[type] ?? type.toUpperCase();
}
