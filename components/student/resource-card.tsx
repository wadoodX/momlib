import type { ResourceLink } from "@/lib/db/content";

type ResourceCardProps = {
  resource: ResourceLink;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const preview = getPreview(resource);

  return (
    <article className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{preview.label}</p>
          <h2 className="mt-3 text-xl font-semibold text-stone-50">{resource.title}</h2>
        </div>
        {resource.href ? (
          <a
            href={resource.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-emerald-200"
          >
            {preview.type === "gamma" ? "Open Gamma" : "Open"}
          </a>
        ) : (
          <span className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-400">Unavailable</span>
        )}
      </div>

      {resource.description ? <p className="mt-4 text-sm leading-6 text-stone-300">{resource.description}</p> : null}

      {resource.href ? <ResourcePreview resource={resource} preview={preview} /> : null}

      <dl className="mt-5 flex flex-wrap gap-4 text-xs text-stone-400">
        {resource.file_name ? <div>File: {resource.file_name}</div> : null}
        {resource.file_size ? <div>Size: {formatFileSize(resource.file_size)}</div> : null}
        {resource.mime_type ? <div>Type: {resource.mime_type}</div> : null}
      </dl>
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
      <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
        <p className="text-sm font-semibold text-emerald-200">Gamma presentation</p>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          Gamma blocks embedded previews on external websites, so this presentation cannot be displayed directly inside Momlib.
        </p>
        <a
          href={resource.href ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-emerald-200"
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
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950">
        {/* Signed Supabase URLs are dynamic, so Next image remote patterns are not useful here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview.src} alt={resource.title} className="max-h-[720px] w-full object-contain" />
      </div>
    );
  }

  if (preview.type === "video") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-800 bg-black">
        <video src={preview.src} controls className="w-full" />
      </div>
    );
  }

  if (preview.type === "pdf" || preview.type === "office") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950">
        <iframe
          title={resource.title}
          src={preview.src}
          className="h-[680px] w-full"
          allow="fullscreen; clipboard-read; clipboard-write"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <p className="mt-5 rounded-2xl border border-stone-800 bg-stone-950 p-4 text-sm leading-6 text-stone-400">
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
