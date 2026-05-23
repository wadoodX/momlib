import { createElement } from "react";
import { colorHex, iconComponent } from "@/lib/customization";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-7", icon: "size-4", radius: "rounded-lg" },
  md: { box: "size-10", icon: "size-5", radius: "rounded-xl" },
  lg: { box: "size-14", icon: "size-7", radius: "rounded-2xl" },
} as const;

/**
 * A colored icon chip for a course/subject. Server-safe (no hooks). Uses inline
 * hex (with low-alpha background) so it reads correctly in light and dark mode.
 * Unset color/icon fall back to sage + the kind's default icon.
 */
export function NodeIcon({
  icon,
  color,
  kind,
  size = "md",
  className,
}: {
  icon?: string | null;
  color?: string | null;
  kind: "course" | "subject";
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const hex = colorHex(color);
  const s = SIZES[size];

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", s.box, s.radius, className)}
      style={{ backgroundColor: `${hex}26`, color: hex }}
    >
      {createElement(iconComponent(icon, kind), { className: s.icon })}
    </span>
  );
}
