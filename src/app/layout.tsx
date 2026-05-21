import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Load IBM Plex Sans Arabic from Google Fonts via Next.js's optimized loader.
// - `subsets`: which character ranges to download (Arabic + Latin so we cover both).
// - `weight`: only ship the weights we'll actually use.
// - `display: "swap"`: show fallback font immediately, swap when loaded.
// - `variable`: exposes the font as a CSS variable we can reference in globals.css
//   and use as a Tailwind `font-sans` token.
const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mini Website Builder",
  description:
    "Build your website by clicking, dragging, and editing — no code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlex.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
