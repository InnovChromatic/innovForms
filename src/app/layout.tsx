/**
 * =============================================================================
 * Root Layout
 * =============================================================================
 * Sets up the global HTML structure, fonts, CSS, and Font Awesome config.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome"; // Font Awesome configuration

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InnovForms — Smart Form Management",
  description:
    "Build, manage, and analyze forms with InnovForms. A modern forms management platform for teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
