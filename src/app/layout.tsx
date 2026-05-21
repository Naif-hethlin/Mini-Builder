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
  title: "ركاز — منصة إنشاء مواقع الأعمال",
  description:
    "أنشئ موقعك بالنقر والسحب والتعديل — بدون كود.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlex.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
