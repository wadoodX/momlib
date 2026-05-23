import {
  MoonStar,
  Moon,
  Star,
  BookOpen,
  BookMarked,
  ScrollText,
  Feather,
  PenTool,
  Languages,
  Compass,
  GraduationCap,
  HandHeart,
  HandCoins,
  Sunrise,
  Droplets,
  Landmark,
  type LucideIcon,
} from "lucide-react";

/** Curated, on-theme accent palette. Stored by `name`; rendered via `hex`. */
export const COLORS: { name: string; hex: string }[] = [
  { name: "sage", hex: "#7c9468" },
  { name: "gold", hex: "#bf9f53" },
  { name: "clay", hex: "#b06a4f" },
  { name: "rose", hex: "#c06b8e" },
  { name: "plum", hex: "#7d5ba6" },
  { name: "ocean", hex: "#4f86b0" },
  { name: "teal", hex: "#4f9e96" },
  { name: "slate", hex: "#5b6b7b" },
];

/** Curated, Islamic-studies-themed lucide icons. Stored by key.
 *  (lucide has no literal mosque glyph; these are the closest evocative set.) */
export const ICONS: Record<string, LucideIcon> = {
  MoonStar, // Islam / general
  Moon,
  Star,
  BookOpen, // Qur'an
  BookMarked, // Tafsir
  ScrollText, // Hadith / manuscripts
  Feather, // Calligraphy / Seerah
  PenTool, // Usul / writing
  Languages, // Arabic (Nahw / Sarf)
  Compass, // Qibla / Fiqh
  GraduationCap, // Alimiyyah / study
  HandHeart, // Du'a / Akhlaq
  HandCoins, // Zakat / Sadaqah
  Sunrise, // Salah times
  Droplets, // Wudu / Taharah
  Landmark, // Masjid / institution
};

export const ICON_NAMES = Object.keys(ICONS);

export const DEFAULT_ICON: Record<"course" | "subject", string> = {
  course: "MoonStar",
  subject: "BookOpen",
};

const DEFAULT_HEX = "#7c9468"; // sage

export function isColor(value: string | null | undefined): value is string {
  return !!value && COLORS.some((c) => c.name === value);
}

export function isIcon(value: string | null | undefined): value is string {
  return !!value && value in ICONS;
}

/** Resolve a stored color name to a hex (falls back to sage). */
export function colorHex(name: string | null | undefined): string {
  return COLORS.find((c) => c.name === name)?.hex ?? DEFAULT_HEX;
}

/** Resolve a stored icon name (or the kind's default) to a component. */
export function iconComponent(name: string | null | undefined, kind: "course" | "subject"): LucideIcon {
  return ICONS[name ?? ""] ?? ICONS[DEFAULT_ICON[kind]];
}
