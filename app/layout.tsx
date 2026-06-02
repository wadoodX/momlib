import type { Metadata } from "next";
import { Montserrat, Inter, Amiri } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const display = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const arabic = Amiri({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "700"],
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
    <html lang="en" className={`${display.variable} ${body.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
