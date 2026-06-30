import { Lock } from "lucide-react";
import type { ResourceLink } from "@/lib/db/content";
import { categoryMeta } from "@/lib/resource-meta";

type ResourceCardProps = {
  resource: ResourceLink;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  // Paid resources are locked: never served a file/preview here (addResourceHref
  // leaves href null), just a "Buy on Payhip" link-out.
  if (resource.is_paid) {
    return <PaidResourceCard resource={resource} />;
  }

  const preview = getPreview(resource);
  const eyebrow = resource.category ? categoryMeta(resource.category).label : preview.label;

  return (
    <article className="rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">{resource.title}</h2>
        </div>
        {resource.href ? (
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

type Preview = {
  label: string;
  type: "image" | "pdf" | "video" | "office" | "gamma" | "link";
  src: string | null;
};

function ResourcePreview({ resource, preview }: { resource: ResourceLink; preview: Preview }) {
  if (preview.type === "gamma") {
    return (
      <div className="mt-5 rounded-2xl border border-sage/30 bg-sage/10 p-5">
        <p className="text-sm font-semibold text-sage-deep">Gamma presentation</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Gamma blocks embedded previews on external websites, so this presentation cannot be displayed directly inside Nibras.
        </p>
        <a
          href={resource.href ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-md bg-sage px-4 py-2 text-sm font-semibold text-paper hover:bg-sage-deep"
        >
          Open presentation
        </a>
      </div>
    );
  }

  if (!preview.src) {
    return null;
  }

  if (preview.type === "image") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        {/* Signed Supabase URLs are dynamic, so Next image remote patterns are not useful here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview.src} alt={resource.title || "Resource"} loading="lazy" className="max-h-[720px] w-full object-contain" />
      </div>
    );
  }

  if (preview.type === "video") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-black">
        <video src={preview.src} controls preload="metadata" className="w-full" />
      </div>
    );
  }

  if (preview.type === "pdf" || preview.type === "office") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <iframe
          title={resource.title}
          src={preview.src}
          loading="lazy"
          className="h-[680px] w-full"
          allow="fullscreen; clipboard-read; clipboard-write"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <p className="mt-5 rounded-2xl border border-line bg-paper-soft p-4 text-sm leading-6 text-muted">
      This external website may block embedded previews. Use the Open button if it does not display here.
    </p>
  );
}

function getPreview(resource: ResourceLink): Preview {
  if (!resource.href) {
    return { label: resource.resource_type, type: "link", src: null };
  }

  if (isGammaUrl(resource.href)) {
    return { label: "Gamma presentation", type: "gamma", src: null };
  }

  if (resource.resource_type === "image") {
    return { label: "Image", type: "image", src: resource.href };
  }

  if (resource.resource_type === "video") {
    return { label: "Video", type: "video", src: resource.href };
  }

  if (resource.resource_type === "pdf") {
    return { label: "PDF", type: "pdf", src: resource.href };
  }

  if (resource.resource_type === "doc" || resource.resource_type === "ppt") {
    return {
      label: resource.resource_type === "doc" ? "Document" : "Presentation",
      type: "office",
      src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.href)}`,
    };
  }

  return { label: "External link", type: "link", src: resource.href };
}

function isGammaUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "gamma.app" || hostname.endsWith(".gamma.app");
  } catch {
    return false;
  }
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
