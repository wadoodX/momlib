"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2Icon, PlusIcon } from "lucide-react";
import { quickAdd } from "@/lib/admin/studio-actions";

/**
 * "Start something new": create a course from just a title and jump straight
 * to it in the studio (quickAdd returns the new id), plus the two standing
 * shortcuts that used to live as bare buttons on the old dashboard.
 */
export function QuickAddCard() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      setError(null);
      try {
        const { id } = await quickAdd("course", null, trimmed);
        router.push(`/admin?course=${id}`);
      } catch {
        setError("Couldn't create the course. Try again.");
      }
    });
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-soft p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Start something new</p>
      <h2 className="font-display mt-2 text-xl font-semibold text-ink">Add a course</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-4 flex gap-2"
      >
        <label htmlFor="quick-add-course" className="sr-only">
          New course title
        </label>
        <input
          id="quick-add-course"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title, e.g. Usul al-Hadith"
          className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-paper-soft disabled:opacity-50"
        >
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : <PlusIcon className="size-4" aria-hidden />}
          Create
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm font-medium">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-ink transition-colors hover:text-gold">
          Open the studio <ArrowRight className="size-3.5" aria-hidden />
        </Link>
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink">
          View as student
        </Link>
      </div>
    </div>
  );
}
