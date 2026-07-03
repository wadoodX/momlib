import type { Metadata } from "next";
import { Amiri, Cormorant_Garamond, Figtree } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const arabic = Amiri({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "700"],
  display: "swap",
});

// The product typefaces (shared by the landing and the signed-in app): an
// editorial serif display (Cormorant Garamond, incl. italic for the hero
// quote) + Figtree for body copy. globals.css maps --font-display/--font-sans
// onto these variables.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nibras.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nibras — The digital library for Islamic studies",
    template: "%s · Nibras",
  },
  description:
    "Nibras is a calm, searchable digital library for Islamic studies. Teachers publish courses, chapters, and resources; students browse, search, preview, and resume — Alimiyyah notes, all in one place.",
  applicationName: "Nibras",
  keywords: [
    "Islamic studies",
    "Alimiyyah",
    "digital library",
    "Islamic studies notes",
    "Qur'an tafsir",
    "hadith",
    "fiqh",
    "Arabic language",
    "madrasa",
    "online Islamic education",
  ],
  authors: [{ name: "Nibras" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Nibras",
    url: siteUrl,
    locale: "en_US",
    title: "Nibras — The digital library for Islamic studies",
    description:
      "A calm, searchable home for Islamic studies — teachers publish, students learn. Alimiyyah courses, chapters, and resources, all in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nibras — The digital library for Islamic studies",
    description: "A calm, searchable home for Islamic studies — teachers publish, students learn.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${arabic.variable} ${cormorant.variable} ${figtree.variable}`}
        suppressHydrationWarning
      >
        <body>
          {/* Thin on-brand bar for the rare slow navigation; the cross-fade covers the fast case. */}
          <NextTopLoader color="#c7a34f" height={2} showSpinner={false} shadow={false} />
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
