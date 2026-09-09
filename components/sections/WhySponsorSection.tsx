'use client';

import React from 'react';

const REASONS = [
  {
    emoji: '🚀',
    title: 'Promote Your Project',
    text: 'Your logo travels with me on my MacBook and becomes part of a community-backed PulseChain initiative.',
  },
  {
    emoji: '🌍',
    title: 'Real-World Visibility',
    text: 'Take your project beyond X, Telegram and Discord with a sponsorship people can actually see.',
  },
  {
    emoji: '💜',
    title: 'Strengthen PulseChain',
    text: 'Twenty percent of every sponsorship is reinvested into community initiatives that help grow the ecosystem.',
  },
];

export function WhySponsorSection() {
  return (
    <section id="why-sponsor" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-12">
          Why sponsor?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="rounded-[20px] bg-[var(--surface)] p-6 flex flex-col gap-3"
            >
              <span className="text-[32px] leading-none">{r.emoji}</span>
              <h3 className="text-[16px] font-semibold text-[var(--ink)]">
                {r.title}
              </h3>
              <p className="text-[14px] text-[var(--ink-2)] leading-relaxed">
                {r.text}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] text-[var(--ink-3)] mt-6">
          That's it.
        </p>
      </div>
    </section>
  );
}
