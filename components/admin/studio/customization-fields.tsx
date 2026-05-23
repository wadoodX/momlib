"use client";

import { COLORS, ICONS, ICON_NAMES, colorHex } from "@/lib/customization";
import { cn } from "@/lib/utils";

type Props = {
  color: string | null;
  icon: string | null;
  onColor: (color: string | null) => void;
  onIcon: (icon: string | null) => void;
};

export function CustomizationFields({ color, icon, onColor, onIcon }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-medium text-ink">Color</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              aria-pressed={color === c.name}
              onClick={() => onColor(color === c.name ? null : c.name)}
              className={cn(
                "size-7 rounded-full ring-offset-2 ring-offset-card transition",
                color === c.name ? "ring-2 ring-ink" : "hover:scale-110",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-ink">Icon</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ICON_NAMES.map((name) => {
            const Icon = ICONS[name];
            const selected = icon === name;
            return (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={selected}
                onClick={() => onIcon(selected ? null : name)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border transition",
                  selected
                    ? "border-sage bg-sage/15 text-sage"
                    : "border-line text-muted hover:border-sage hover:text-ink",
                )}
                style={selected ? { color: colorHex(color) } : undefined}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
