import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "PulseSticker — Get Your Brand on My MacBook",
  description:
    "10 sticker spots on a MacBook lid. Pay crypto to claim yours. Outbid anytime. The PulseChain community leaderboard.",
  keywords: [
    "PulseChain",
    "MacBook sticker",
    "crypto advertising",
    "sticker spots",
    "pay to rank",
    "leaderboard",
  ],
  openGraph: {
    title: "PulseSticker — Get Your Brand on My MacBook",
    description:
      "10 sticker spots on a MacBook lid. Pay crypto to claim yours. Outbid anytime.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pulse-sticker-mac.vercel.app',
    siteName: "PulseSticker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseSticker — Get Your Brand on My MacBook",
    description:
      "10 sticker spots. Pay crypto. Outbid anytime. PulseChain community leaderboard.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-white text-[#1d1d1f] font-[var(--font-inter),system-ui,-apple-system,sans-serif] antialiased min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
