import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const body = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
});

const label = JetBrains_Mono({
  variable: "--font-label",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.type}, ${site.city}`,
  description: `${site.type} ${site.name} ${site.cityIn}. Портфоліо майстра, ціни та онлайн-запис на сеанс.`,
  openGraph: {
    title: `${site.name} — ${site.type}`,
    description: "Портфоліо майстра та онлайн-запис на сеанс",
    locale: "uk_UA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${body.variable} ${label.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
