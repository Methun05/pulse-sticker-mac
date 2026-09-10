'use client';

import React from 'react';
import Link from 'next/link';

export function WhyIBuiltThisSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-8">
          Why I built this
        </h2>

        <div className="space-y-4 text-[15px] text-[var(--ink-2)] leading-relaxed">
          <p>
            Hi, I'm Methun. Crypto is still mostly discussed inside crypto circles.
            I wanted to change that.
          </p>
          <p>
            PulseSticker lets projects sponsor my MacBook while helping fund a community
            initiative to bring PulseChain into the real world.
          </p>
          <p>
            It's simple. Support a project. Support the ecosystem. Carry PulseChain further.
          </p>
        </div>

        <Link
          href="/manifesto"
          className="inline-block mt-8 text-[14px] font-medium text-[var(--blue)] hover:underline"
        >
          Read the manifesto →
        </Link>
      </div>
    </section>
  );
}
