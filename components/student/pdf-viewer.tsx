"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Canvas-based, continuously-scrolling PDF viewer with our own zoom / page
// controls. We render the PDF ourselves (rather than an <iframe> to the file)
// so students get zoom in/out without the browser viewer's download/print
// toolbar, and no text layer to copy from. Pages stack vertically and render
// lazily as they near the viewport, so long decks stay responsive. pdfjs needs
// the DOM, so it is imported lazily in an effect and never evaluated during SSR.

type Status = "loading" | "ready" | "error";

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const STEP = 0.2;

const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

export function PdfViewer({
  url,
  title,
  heightClass = "h-[680px]",
}: {
  url: string;
  title?: string;
  heightClass?: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.1);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load the document (browser only — pdfjs touches the DOM at import time).
  useEffect(() => {
    let cancelled = false;
    // Destroying the loading task tears down the worker + the loaded document.
    let loadingTask: { promise: Promise<PDFDocumentProxy>; destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        setStatus("loading");
        setDoc(null);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        loadingTask = pdfjs.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNum(1);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [url]);

  // Fit the first page to the container width once the document is ready.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(1);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const avail = (containerRef.current?.clientWidth ?? base.width) - 32;
      if (avail > 0) setScale(clampScale(avail / base.width));
    })();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  // Track which page sits under the container's vertical midpoint for the counter.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !numPages) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = container.scrollTop + container.clientHeight / 2;
        const pages = container.querySelectorAll<HTMLElement>("[data-page]");
        let current = 1;
        for (const p of pages) {
          if (p.offsetTop <= mid) current = Number(p.dataset.page);
          else break;
        }
        setPageNum(current);
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [numPages]);

  const goToPage = useCallback(
    (n: number) => {
      const container = containerRef.current;
      if (!container) return;
      const clamped = Math.min(numPages, Math.max(1, n));
      const el = container.querySelector<HTMLElement>(`[data-page="${clamped}"]`);
      if (el) container.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: "smooth" });
    },
    [numPages],
  );

  const fitWidth = useCallback(async () => {
    if (!doc || !containerRef.current) return;
    const page = await doc.getPage(pageNum);
    const base = page.getViewport({ scale: 1 });
    const avail = containerRef.current.clientWidth - 32;
    if (avail > 0) setScale(clampScale(avail / base.width));
  }, [doc, pageNum]);

  const zoomOut = () => setScale((s) => clampScale(Number((s - STEP).toFixed(2))));
  const zoomIn = () => setScale((s) => clampScale(Number((s + STEP).toFixed(2))));

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-soft">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-card px-3 py-2 text-ink">
        <ToolbarButton onClick={zoomOut} disabled={scale <= MIN_SCALE} label="Zoom out">
          <ZoomOut className="size-4" />
        </ToolbarButton>
        <span className="w-12 text-center text-xs font-semibold tabular-nums text-muted">
          {Math.round(scale * 100)}%
        </span>
        <ToolbarButton onClick={zoomIn} disabled={scale >= MAX_SCALE} label="Zoom in">
          <ZoomIn className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={fitWidth} label="Fit width">
          <Maximize2 className="size-4" />
        </ToolbarButton>

        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1} label="Previous page">
            <ChevronUp className="size-4" />
          </ToolbarButton>
          <span className="min-w-[5.5rem] text-center text-xs font-semibold tabular-nums text-muted">
            {numPages ? `Page ${pageNum} / ${numPages}` : "—"}
          </span>
          <ToolbarButton
            onClick={() => goToPage(pageNum + 1)}
            disabled={!numPages || pageNum >= numPages}
            label="Next page"
          >
            <ChevronDown className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <div ref={containerRef} className={`relative overflow-auto bg-paper-soft ${heightClass}`}>
        {status === "error" ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
            This PDF could not be displayed here.
          </div>
        ) : status === "loading" || !doc ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted">Loading PDF…</div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-4">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={i + 1}
                doc={doc}
                pageNumber={i + 1}
                scale={scale}
                rootRef={containerRef}
                label={title ? `${title} — page ${i + 1}` : `PDF page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// A single page: reserves its (scaled) height immediately so the scrollbar is
// correct, then paints its canvas once it scrolls near the viewport.
function PdfPage({
  doc,
  pageNumber,
  scale,
  rootRef,
  label,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rootRef: React.RefObject<HTMLDivElement | null>;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [active, setActive] = useState(false);

  // Measure the page at the current scale so the placeholder reserves height.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const vp = page.getViewport({ scale });
      setDims({ w: Math.floor(vp.width), h: Math.floor(vp.height) });
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, scale]);

  // Begin painting once the page nears the viewport; stay painted afterwards.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || active) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setActive(true);
      },
      { root: rootRef.current ?? null, rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, rootRef]);

  // Paint (and repaint on zoom) while active.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vp = page.getViewport({ scale });
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = `${Math.floor(vp.width)}px`;
      canvas.style.height = `${Math.floor(vp.height)}px`;
      task = page.render({
        canvas,
        viewport: vp,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      try {
        await task.promise;
      } catch {
        // Superseded by a newer zoom/unmount — ignore.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [active, doc, pageNumber, scale]);

  return (
    <div
      ref={wrapRef}
      data-page={pageNumber}
      style={dims ? { width: dims.w, height: dims.h } : undefined}
      className="overflow-hidden rounded-md bg-white shadow-sm"
    >
      <canvas ref={canvasRef} aria-label={label} className="block" />
    </div>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-paper-soft disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
