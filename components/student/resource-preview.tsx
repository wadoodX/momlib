import type { ResourceLink } from "@/lib/db/content";
import { isGammaUrl, isGammaEmbedUrl } from "@/lib/embeds";

// Shared, hook-free preview logic used by both the student resource card and the
// admin Content Studio. Renders an inline embed (PDF/Office/image/video/Gamma) or
// a link-out notice (non-embed Gamma / generic links) based on `href` + type.

export type Preview = {
  label: string;
  type: "image" | "pdf" | "video" | "office" | "gamma" | "gamma-embed" | "link";
  src: string | null;
};

export function getResourcePreview(resource: ResourceLink): Preview {
  if (!resource.href) {
    return { label: resource.resource_type, type: "link", src: null };
  }

  if (isGammaEmbedUrl(resource.href)) {
    return { label: "Gamma presentation", type: "gamma-embed", src: resource.href };
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
    // #toolbar=0 hides the browser PDF viewer's download/print bar; navpanes=0 hides the sidebar.
    // (Best-effort — honored by Chrome/Edge; a raw fetch can still bypass it.)
    return { label: "PDF", type: "pdf", src: `${resource.href}#toolbar=0&navpanes=0` };
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

/** Frame height for the embedded viewers; the admin studio uses a shorter one. */
export function ResourcePreview({
  resource,
  preview,
  height = "h-[680px]",
}: {
  resource: ResourceLink;
  preview: Preview;
  height?: string;
}) {
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

  if (preview.type === "gamma-embed" && preview.src) {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <iframe
          title={resource.title || "Gamma presentation"}
          src={preview.src}
          loading="lazy"
          className="aspect-video w-full"
          allow="fullscreen"
          referrerPolicy="no-referrer"
        />
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
          className={`w-full ${height}`}
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
