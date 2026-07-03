"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Canvas-based, continuously-scrolling PDF viewer with our own zoom / page
// controls. We render the PDF ourselves (rather than an <iframe> to the file)
// so students get zoom without the browser viewer's download/print toolbar, and
// no text layer to copy from.
//
// Two properties keep it responsive on long decks: (1) page placeholders are
// sized *arithmetically* from a base viewport (× scale), so reserving scroll
// height costs no pdfjs call per page, and (2) each page paints its canvas only
// while it's near the viewport and releases the backing store once it scrolls
// away (windowing), so memory stays bounded. pdfjs needs the DOM, so it's
// imported lazily in an effect and never evaluated during SSR.

type Status = "loading" | "ready" | "error";
type Size = { w: number; h: number };

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const STEP = 0.2;
const LOAD_TIMEOUT_MS = 30_000;
// Pages within this vertical margin of the viewport stay painted; beyond it the
// canvas backing store is freed so a long PDF can't exhaust memory.
const KEEPALIVE_MARGIN = "1200px 0px";

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
  const [base, setBase] = useState<Size | null>(null); // page-1 viewport @ scale 1, for placeholder sizing
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1);
  const [reloadNonce, setReloadNonce] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load the document (browser only — pdfjs touches the DOM at import time).
  useEffect(() => {
    let cancelled = false;
    // Destroying the loading task tears down the worker + the loaded document.
    let loadingTask: { promise: Promise<PDFDocumentProxy>; destroy: () => Promise<void> } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        setStatus("loading");
        setDoc(null);
        setBase(null);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        loadingTask = pdfjs.getDocument({ url });
        // Bail out of a perpetual "Loading…" if the fetch hangs.
        timer = setTimeout(() => {
          if (!cancelled) void loadingTask?.destroy();
        }, LOAD_TIMEOUT_MS);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const first = await pdf.getPage(1);
        if (cancelled) return;
        const vp = first.getViewport({ scale: 1 });
        // Compute fit-to-width *before* rendering pages so they mount at their
        // final scale (avoids an initial double paint / reflow).
        const avail = (containerRef.current?.clientWidth ?? vp.width) - 32;
        setDoc(pdf);
        setNumPages(pdf.numPages);
        setBase({ w: vp.width, h: vp.height });
        setScale(avail > 0 ? clampScale(avail / vp.width) : 1);
        setPageNum(1);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      void loadingTask?.destroy();
    };
  }, [url, reloadNonce]);

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
  }, [numPages, status]);

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

  const fitWidth = useCallback(() => {
    if (!base || !containerRef.current) return;
    const avail = containerRef.current.clientWidth - 32;
    if (avail > 0) setScale(clampScale(avail / base.w));
  }, [base]);

  const zoomOut = () => setScale((s) => clampScale(Number((s - STEP).toFixed(2))));
  const zoomIn = () => setScale((s) => clampScale(Number((s + STEP).toFixed(2))));

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper-soft">
      <div
        role="toolbar"
        aria-label="PDF controls"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-card px-3 py-2 text-ink"
      >
        <ToolbarButton onClick={zoomOut} disabled={scale <= MIN_SCALE} label="Zoom out">
          <ZoomOut className="size-4" />
        </ToolbarButton>
        <span aria-live="polite" className="w-12 text-center text-xs font-semibold tabular-nums text-muted">
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
          <span
            aria-live="polite"
            className="min-w-[5.5rem] text-center text-xs font-semibold tabular-nums text-muted"
          >
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

      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label={title ? `${title} (PDF)` : "PDF document"}
        className={`relative overflow-auto bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50 ${heightClass}`}
      >
        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted">
            <p>This PDF could not be displayed here.</p>
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-card"
            >
              Retry
            </button>
          </div>
        ) : status === "loading" || !doc || !base ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted">Loading PDF…</div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-4">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={i + 1}
                doc={doc}
                pageNumber={i + 1}
                scale={scale}
                base={base}
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

// A single page. Its wrapper height is derived arithmetically from a base
// viewport (× scale) so the scrollbar is correct without a pdfjs call per page;
// the canvas only paints while near the viewport and is released when it scrolls
// away, keeping memory bounded on long documents.
function PdfPage({
  doc,
  pageNumber,
  scale,
  base,
  rootRef,
  label,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  base: Size;
  rootRef: React.RefObject<HTMLDivElement | null>;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pageBase, setPageBase] = useState<Size | null>(null); // this page's own @scale-1 size, learned on first paint
  const [active, setActive] = useState(false);

  // Paint near-viewport pages, release far ones (windowing).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setActive(e.isIntersecting);
      },
      { root: rootRef.current ?? null, rootMargin: KEEPALIVE_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  // Paint (and repaint on zoom) while active.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      let page;
      try {
        page = await doc.getPage(pageNumber);
      } catch {
        return; // document torn down mid-load — swallow the rejection
      }
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const base1 = page.getViewport({ scale: 1 });
      setPageBase((prev) =>
        prev && prev.w === base1.width && prev.h === base1.height ? prev : { w: base1.width, h: base1.height },
      );
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
        // Superseded by a newer zoom, or cancelled on unmount — ignore.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [active, doc, pageNumber, scale]);

  // Free the backing store when the page scrolls out of the keep-alive window.
  useEffect(() => {
    if (active) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }, [active]);

  const size = pageBase ?? base;
  return (
    <div
      ref={wrapRef}
      data-page={pageNumber}
      style={{ width: Math.floor(size.w * scale), height: Math.floor(size.h * scale) }}
      // bg-white is intentional: a PDF sheet is white in both themes, and pdfjs
      // paints a white page background regardless of the app theme.
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
