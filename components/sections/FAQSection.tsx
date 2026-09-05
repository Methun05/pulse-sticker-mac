'use client';

import React, { useState } from 'react';

const FAQS = [
  {
    q: 'Is this real?',
    a: 'Yes. This is a real MacBook with 10 physical sticker spots. When you win a spot, your brand logo is printed and physically placed on the laptop lid.',
  },
  {
    q: 'What does buying a spot get me?',
    a: 'Your brand logo printed as a sticker on the MacBook lid, plus a clickable link on this website. The laptop is carried to meetups, coworking spaces, and events in the PulseChain community.',
  },
  {
    q: 'How does payment work?',
    a: 'You send stablecoins (USDC, USDT, or DAI) to a deposit address. The payment is verified on-chain automatically. Supported chains: Ethereum, Base, BSC, Polygon, and PulseChain.',
  },
  {
    q: 'Can I be outbid?',
    a: 'Yes. This is an ongoing leaderboard, not a timed auction. Anyone can outbid you at any time by paying more. When outbid, your sticker is replaced with the new highest bidder\'s logo.',
  },
  {
    q: 'What happens to my payment if I get outbid?',
    a: 'Payments are non-refundable. Your brand had visibility on the laptop for the period you held the spot. Think of it as advertising — you paid for the time your sticker was live.',
  },
  {
    q: 'What tokens and chains are supported?',
    a: 'USDC, USDT, and DAI on Ethereum, Base, BSC, Polygon, and PulseChain. Native tokens (ETH, BNB) will be added in a future update.',
  },
  {
    q: 'How long does payment verification take?',
    a: 'Usually under 2 minutes. The system checks the blockchain for your transfer every few seconds. You have a 30-minute window to complete the payment.',
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-10">
          Questions
        </h2>

        <div className="divide-y divide-[var(--hairline)]">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-[15px] font-medium text-[var(--ink)] pr-4">{faq.q}</span>
                <span className="text-[20px] text-[var(--ink-3)] flex-shrink-0 transition-transform duration-200"
                  style={{ transform: openIdx === i ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              <div className={`faq-answer ${openIdx === i ? 'open' : ''}`}>
                <div>
                  <p className="pb-4 text-[14px] text-[var(--ink-2)] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
