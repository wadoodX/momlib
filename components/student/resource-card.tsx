import { Lock } from "lucide-react";
import type { ResourceLink } from "@/lib/db/content";
import { categoryMeta } from "@/lib/resource-meta";
import { getResourcePreview, ResourcePreview } from "@/components/student/resource-preview";

type ResourceCardProps = {
  resource: ResourceLink;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  // Paid resources are locked: never served a file/preview here (addResourceHref
  // leaves href null), just a "Buy on Payhip" link-out.
  if (resource.is_paid) {
    return <PaidResourceCard resource={resource} />;
  }

  const preview = getResourcePreview(resource);
  const eyebrow = resource.category ? categoryMeta(resource.category).label : preview.label;

  return (
    <article className="rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">{resource.title}</h2>
        </div>
        {/* Inline-only types (Gamma embeds, PDFs) render below, so no separate "Open" affordance. */}
        {preview.type === "gamma-embed" || preview.type === "pdf" ? null : resource.href ? (
          <a
            href={resource.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-paper hover:bg-sage-deep"
          >
            {preview.type === "gamma" ? "Open Gamma" : "Open"}
          </a>
        ) : (
          <span className="rounded-md border border-line px-4 py-2 text-sm text-muted">Unavailable</span>
        )}
      </div>

      {resource.description ? <p className="mt-4 text-sm leading-6 text-muted">{resource.description}</p> : null}

      {resource.href ? <ResourcePreview resource={resource} preview={preview} /> : null}

      <dl className="mt-5 flex flex-wrap gap-4 text-xs text-muted">
        {resource.file_name ? <div>File: {resource.file_name}</div> : null}
        {resource.file_size ? <div>Size: {formatFileSize(resource.file_size)}</div> : null}
        {resource.mime_type ? <div>Type: {resource.mime_type}</div> : null}
      </dl>
    </article>
  );
}

// Locked state for a paid resource: a category chip + a "Buy on Payhip" link-out.
// The file is never embedded or signed (href is null for paid rows), so nothing
// here exposes the underlying file.
function PaidResourceCard({ resource }: { resource: ResourceLink }) {
  const meta = categoryMeta(resource.category);
  const Icon = meta.icon;

  return (
    <article className="rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{meta.label}</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{resource.title}</h2>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold">
          <Lock className="size-3.5" />
          Paid
        </span>
      </div>

      {resource.description ? <p className="mt-4 text-sm leading-6 text-muted">{resource.description}</p> : null}

      <div className="mt-5">
        {resource.payhip_url ? (
          <a
            href={resource.payhip_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-md bg-sage px-4 py-2 text-sm font-semibold text-paper hover:bg-sage-deep"
          >
            Buy on Payhip
          </a>
        ) : (
          <span className="inline-flex rounded-md border border-line px-4 py-2 text-sm text-muted">Coming soon</span>
        )}
      </div>
    </article>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
