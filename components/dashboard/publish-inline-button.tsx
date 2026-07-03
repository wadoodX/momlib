"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { setPublished, type NodeKind } from "@/lib/admin/studio-actions";

/**
 * One-click "Publish" for a needs-attention row. Rendered as a SIBLING of the
 * row's link (never nested inside it). The action revalidates /dashboard, so
 * the row disappears from the queue on the same round trip — no router.refresh.
 */
export function PublishInlineButton({ kind, id }: { kind: NodeKind; id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setError(false);
          try {
            await setPublished(kind, id, true);
          } catch {
            setError(true);
          }
        })
      }
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sage px-3.5 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
    >
      {pending ? <Loader2Icon className="size-3.5 animate-spin" aria-hidden /> : null}
      {error ? "Retry publish" : pending ? "Publishing…" : "Publish"}
    </button>
  );
}
