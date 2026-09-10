import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

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
    <html lang="en" className="scroll-smooth">
      <head>
        <script defer async src="https://integrate.depay.com/widgets/v13.js"></script>
      </head>
      <body className="bg-white text-[#1d1d1f] antialiased min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
