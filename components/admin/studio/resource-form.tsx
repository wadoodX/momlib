"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFileResource, createLinkResource } from "@/lib/admin/content-actions";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage";

export function ResourceForm({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"file" | "link">("file");
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
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add the resource.");
      }
    });
  }

  return (
    <form ref={formRef} action={submit} className="rounded-2xl border border-line bg-paper-soft/60 p-4">
      <input type="hidden" name="chapter_id" value={chapterId} />

      {/* File | Link toggle */}
      <div className="inline-grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper-soft p-1">
        {(["file", "link"] as const).map((m) => {
          const Icon = m === "file" ? Upload : Link2;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors",
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
        <label className="block">
          <span className="text-xs font-medium text-ink">Title</span>
          <input required name="title" className={inputClass} />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink">Description</span>
          <textarea name="description" rows={2} className={inputClass} />
        </label>

        {mode === "file" ? (
          <label className="block">
            <span className="text-xs font-medium text-ink">File</span>
            <input
              required
              name="file"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-3 py-2.5 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-paper"
            />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-xs font-medium text-ink">External URL</span>
              <input required name="external_url" type="url" placeholder="https://gamma.app/..." className={inputClass} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input name="is_gamma" type="checkbox" className="size-4 accent-sage" />
              This is a Gamma presentation link
            </label>
          </>
        )}

        <label className="flex items-center gap-2 text-sm text-ink">
          <input name="is_published" type="checkbox" className="size-4 accent-sage" />
          Publish immediately
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-sage-deep disabled:opacity-60"
        >
          {pending ? "Adding…" : mode === "file" ? "Upload file" : "Add link"}
        </button>
      </div>
    </form>
  );
}
