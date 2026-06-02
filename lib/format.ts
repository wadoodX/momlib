/** Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago". */
export function timeAgo(date: string | Date): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.round((Date.now() - then.getTime()) / 1000);

  if (!Number.isFinite(seconds)) return "";
  if (seconds < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.round(days / 365)}y ago`;
}

export type NodeMeta = {
  status: "Core" | "Optional" | null;
  coreText: string | null;
  detail: string | null;
};

/**
 * Parse a course/subject `description` like
 * "Core Module · Core text: Al-Fiqh ul Muyassar by …" into its parts, so a card
 * can show a status pill + a tidy core-text line instead of the raw string.
 * Tolerant of missing pieces: course descriptions are null, some subjects are a
 * bare "Core Module", and a few carry "Core text: …" with no "Module" prefix.
 */
export function parseNodeDescription(description: string | null | undefined): NodeMeta {
  const segments = (description ?? "")
    .split("·")
    .map((segment) => segment.trim())
    .filter(Boolean);

  let status: NodeMeta["status"] = null;
  let coreText: string | null = null;
  const details: string[] = [];

  segments.forEach((segment, index) => {
    if (index === 0 && /^core module$/i.test(segment)) {
      status = "Core";
      return;
    }
    if (index === 0 && /^optional module$/i.test(segment)) {
      status = "Optional";
      return;
    }
    const coreTextMatch = segment.match(/^core texts?:\s*(.+)$/i);
    if (coreTextMatch) {
      coreText = coreTextMatch[1].trim();
      return;
    }
    details.push(segment);
  });

  return { status, coreText, detail: details.length ? details.join(" · ") : null };
}
