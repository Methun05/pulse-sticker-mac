'use client';

import React from 'react';
import { Accordion } from '@/components/ui/Accordion';

const FAQS = [
  {
    title: 'How does this work?',
    content:
      'Pick a spot on the MacBook, pay with stablecoins, and your logo gets physically stickered on the laptop. Your brand stays visible at meetups, coworking spaces, and events.',
  },
  {
    title: 'What tokens are accepted?',
    content:
      'USDC, USDT, and DAI on Ethereum, Base, BSC, Polygon, and PulseChain. Native tokens like ETH and BNB are coming soon.',
  },
  {
    title: 'Can I be outbid?',
    content:
      "Yes. This is an ongoing leaderboard — anyone can outbid you at any time. When outbid, your sticker is replaced with the new highest bidder's logo.",
  },
  {
    title: 'How long does verification take?',
    content:
      'Usually under 2 minutes. The system checks the blockchain for your transfer every few seconds. You have a 30-minute window to complete payment.',
  },
  {
    title: 'What happens if I get outbid?',
    content:
      'Payments are non-refundable. Your brand had visibility for the period you held the spot — think of it as advertising for the time your sticker was live.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-10">
          Questions
        </h2>
        <Accordion items={FAQS} />
      </div>
    </section>
  );
}
