'use client';

import React from 'react';
import { Accordion } from '@/components/ui/Accordion';

const FAQS = [
  {
    title: 'Why would a project sponsor this?',
    content:
      'Your logo goes on a real MacBook that travels to meetups, coworking spaces, and events. It is real-world visibility for your project outside of crypto Twitter and Telegram.',
  },
  {
    title: 'What happens if I\'m outbid?',
    content:
      'Your sticker gets replaced by the new highest bidder. Payments are non-refundable, your project had visibility for the time you held the spot.',
  },
  {
    title: 'Where does the money go?',
    content:
      'Twenty percent is reinvested into PulseChain community initiatives. The rest covers sticker production, shipping, and running the platform.',
  },
  {
    title: 'Is this a real MacBook?',
    content:
      'Yes. It is my personal MacBook that I use every day. The stickers are physically printed and placed on the lid.',
  },
  {
    title: 'How often is the MacBook updated?',
    content:
      'Stickers are updated whenever a new bid is confirmed. I print and apply the new sticker within a few days of payment verification.',
  },
  {
    title: 'Can anyone contribute?',
    content:
      'Anyone can bid on a spot. You do not need to represent a project, you just need a wallet and stablecoins on a supported chain.',
  },
  {
    title: 'Why only PulseChain projects?',
    content:
      'This started as a PulseChain community initiative. The goal is to bring visibility to PulseChain ecosystem projects specifically.',
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
