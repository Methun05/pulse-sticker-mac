'use client';

import React from 'react';

const STEPS = [
  {
    num: '1',
    title: 'Pick a spot',
    description: 'Choose from 10 spots on the MacBook lid. Each spot has a size, position, and starting price. Bigger spots cost more.',
  },
  {
    num: '2',
    title: 'Pay with crypto',
    description: 'Send USDC, USDT, or DAI on Ethereum, Base, BSC, Polygon, or PulseChain. Payment is verified on-chain automatically — no middleman.',
  },
  {
    num: '3',
    title: 'Your sticker goes on',
    description: 'Your brand logo gets printed and physically placed on the MacBook lid. It stays there as long as you hold the spot. Anyone can outbid you anytime.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-12">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map(step => (
            <div key={step.num} className="text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-[var(--blue)] text-white flex items-center justify-center text-[15px] font-bold mx-auto md:mx-0 mb-4">
                {step.num}
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--ink)] mb-2">{step.title}</h3>
              <p className="text-[14px] text-[var(--ink-2)] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
