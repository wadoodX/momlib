import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momlib",
  description: "Student resource portal for Islamic Studies notes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
