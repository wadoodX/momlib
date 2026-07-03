"use client";

import { useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { setChapterCompleted } from "@/lib/student/progress-actions";
import { cn } from "@/lib/utils";

// Optimistic toggle for chapter completion. Flips immediately, calls the server
// action in a transition, and reverts if it fails.
export function MarkCompleteButton({ chapterId, initialCompleted }: { chapterId: string; initialCompleted: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      try {
        await setChapterCompleted(chapterId, next);
      } catch {
        setCompleted(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={completed}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
        completed ? "bg-sage text-paper hover:bg-sage-deep" : "border border-line text-ink hover:border-sage",
      )}
    >
      {completed ? <Check className="size-4" /> : <Circle className="size-4" />}
      {completed ? "Completed" : "Mark complete"}
    </button>
  );
}
