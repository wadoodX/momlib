"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFileResource, createLinkResource } from "@/lib/admin/content-actions";
import { RESOURCE_CATEGORIES } from "@/lib/resource-meta";
import { AccessFields } from "./access-fields";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage focus-visible:ring-2 focus-visible:ring-sage";

export function ResourceForm({ chapterId, onAdded }: { chapterId: string; onAdded?: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "file") {
          await createFileResource(formData);
        } else {
          await createLinkResource(formData);
        }
        formRef.current?.reset();
        setPaid(false);
        onAdded?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add the resource.");
      }
    });
  }

  return (
    <form ref={formRef} action={submit} className="rounded-2xl border border-dashed border-line bg-paper-soft/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Add resource</p>
      <input type="hidden" name="chapter_id" value={chapterId} />

      {/* Upload file | Add link toggle */}
      <div className="mt-3 inline-grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper-soft p-1">
        {(["file", "link"] as const).map((m) => {
          const Icon = m === "file" ? Upload : Link2;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                mode === m ? "bg-sage text-paper" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-4" />
              {m === "file" ? "Upload file" : "Add link"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3">
        {mode === "file" ? (
          <label className="block">
            <span className="text-xs font-medium text-ink">File</span>
            <input
              required
              name="file"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition focus:border-sage focus-visible:ring-2 focus-visible:ring-sage file:mr-3 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-paper"
            />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-xs font-medium text-ink">Link</span>
              <input required name="external_url" type="url" placeholder="https://gamma.app/..." className={inputClass} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input name="is_gamma" type="checkbox" className="size-4 accent-sage" />
              This is a Gamma presentation link
            </label>
          </>
        )}

        <label className="block">
          <span className="text-xs font-medium text-ink">Title</span>
          <input required name="title" className={inputClass} />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink">
            Description <span className="text-muted">(optional)</span>
          </span>
          <textarea name="description" rows={2} className={inputClass} />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink">Type</span>
          <select name="category" defaultValue="" className={inputClass}>
            <option value="">— none —</option>
            {RESOURCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <AccessFields paid={paid} onPaid={setPaid} />

        <label className="flex items-center gap-2 text-sm text-ink">
          <input name="is_published" type="checkbox" className="size-4 accent-sage" />
          Publish immediately
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          {pending ? "Adding…" : mode === "file" ? "Upload file" : "Add link"}
        </button>
      </div>
    </form>
  );
}
