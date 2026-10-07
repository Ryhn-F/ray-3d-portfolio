import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rayhan Firdaus — Frontend Developer",
  description:
    "Portfolio of Muhammad Rayhan Firdaus: frontend developer in Jakarta building interactive, fast, thoughtful web experiences. Fly over a 3D city of projects.",
};

export const viewport: Viewport = {
  themeColor: "#04050a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${unbounded.variable} ${jetbrains.variable}`}>
      <body>
        {/* Without JS there is no splash to dismiss. */}
        <noscript>
          <style>{".splash{display:none!important}html.is-locked{overflow:auto!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
