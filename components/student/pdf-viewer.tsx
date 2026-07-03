"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Canvas-based PDF viewer with our own zoom / page controls. We render the PDF
// ourselves (rather than an <iframe> to the file) so students get zoom in/out
// and page navigation without the browser viewer's download/print toolbar, and
// no text layer to copy from. pdfjs needs the DOM, so it is imported lazily
// inside an effect and never evaluated during SSR.

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Fit to the container width once the document is ready.
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

  // (Re)render the current page whenever the page or zoom changes.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const page = await doc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale });
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      task = page.render({
        canvas,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      try {
        await task.promise;
      } catch {
        // Rendering was cancelled by a newer page/zoom — ignore.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNum, scale]);

  const fitWidth = useCallback(async () => {
    if (!doc || !containerRef.current) return;
    const page = await doc.getPage(pageNum);
    const base = page.getViewport({ scale: 1 });
    const avail = containerRef.current.clientWidth - 32;
    if (avail > 0) setScale(clampScale(avail / base.width));
  }, [doc, pageNum]);

  const zoomOut = () => setScale((s) => clampScale(Number((s - STEP).toFixed(2))));
  const zoomIn = () => setScale((s) => clampScale(Number((s + STEP).toFixed(2))));
  const prevPage = () => setPageNum((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNum((p) => Math.min(numPages, p + 1));

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
          <ToolbarButton onClick={prevPage} disabled={pageNum <= 1} label="Previous page">
            <ChevronLeft className="size-4" />
          </ToolbarButton>
          <span className="min-w-[5.5rem] text-center text-xs font-semibold tabular-nums text-muted">
            {numPages ? `Page ${pageNum} / ${numPages}` : "—"}
          </span>
          <ToolbarButton onClick={nextPage} disabled={!numPages || pageNum >= numPages} label="Next page">
            <ChevronRight className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <div ref={containerRef} className={`overflow-auto bg-paper-soft ${heightClass}`}>
        {status === "error" ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
            This PDF could not be displayed here.
          </div>
        ) : (
          <div className="flex min-h-full items-start justify-center p-4">
            {status === "loading" ? (
              <div className="flex h-full items-center justify-center py-16 text-sm text-muted">Loading PDF…</div>
            ) : null}
            {/* Canvas is kept mounted so the render effect always has its target. */}
            <canvas
              ref={canvasRef}
              aria-label={title ? `${title} (PDF)` : "PDF page"}
              className={`max-w-full rounded-md shadow-sm ${status === "ready" ? "" : "hidden"}`}
            />
          </div>
        )}
      </div>
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
