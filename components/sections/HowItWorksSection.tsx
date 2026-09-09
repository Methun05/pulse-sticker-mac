'use client';

import React from 'react';

const STEPS = [
  { num: '1', title: 'Place the highest bid' },
  { num: '2', title: 'Your project takes the spot' },
  { num: '3', title: 'Keep it until someone outbids you' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="display-title-gradient text-center text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.04em] uppercase mb-4">
          How It Works
        </h2>
        <p className="text-center text-[15px] text-[var(--ink-2)] mb-12 max-w-lg mx-auto">
          Three steps. No middleman. Your project on a real MacBook.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-[var(--hairline)] shadow-sm p-6 bg-white"
            >
              <span className="text-[clamp(2rem,4vw,3rem)] font-bold text-[var(--ink)] leading-none">
                {step.num}
              </span>
              <p className="mt-3 text-[16px] font-semibold text-[var(--ink)]">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
