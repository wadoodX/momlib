import { describe, it, expect } from "vitest";
import { isColor, isIcon, colorHex, iconComponent, ICONS, DEFAULT_ICON } from "@/lib/customization";

describe("customization validators", () => {
  it("isColor accepts palette names, rejects others", () => {
    expect(isColor("sage")).toBe(true);
    expect(isColor("gold")).toBe(true);
    expect(isColor("neon")).toBe(false);
    expect(isColor(null)).toBe(false);
  });

  it("isIcon accepts registry keys, rejects others", () => {
    expect(isIcon("BookOpen")).toBe(true);
    expect(isIcon("Library")).toBe(false); // removed in the Islamic-studies set
    expect(isIcon(null)).toBe(false);
  });

  it("colorHex resolves known names and falls back to sage", () => {
    expect(colorHex("gold")).toBe("#b08a3c");
    expect(colorHex(null)).toBe("#4e8a70");
    expect(colorHex("nope")).toBe("#4e8a70");
  });

  it("iconComponent falls back to the kind default", () => {
    expect(iconComponent("MoonStar", "course")).toBe(ICONS.MoonStar);
    expect(iconComponent(null, "course")).toBe(ICONS[DEFAULT_ICON.course]);
    expect(iconComponent("bogus", "subject")).toBe(ICONS[DEFAULT_ICON.subject]);
  });
});
