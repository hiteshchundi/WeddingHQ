import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeEffects } from "../components/theme/theme-effects";
import { preferenceBootstrap } from "../components/theme/preferences";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Wedding HQ",
  description: "Wedding HQ wedding coordination prototype.",
  icons: { icon: "/brand/wedding-hq-mark.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${newsreader.variable}`}
      data-theme="system"
      data-eye-comfort="off"
      data-comfort-period="day"
      data-sidebar-collapsed="false"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
      </head>
      <body>
        <ThemeEffects />
        {children}
      </body>
    </html>
  );
}
