'use client';

import React from 'react';

export function YourBrandSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Text */}
        <div className="order-2 md:order-1">
          <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-4">
            Your project, on my MacBook
          </h2>
          <div className="space-y-3 text-[15px] text-[var(--ink-2)] leading-relaxed">
            <p>
              Crypto lives online. Telegram groups, Twitter threads, Discord servers.
              But nobody sees your brand in the real world.
            </p>
            <p>
              Sponsor a spot and your logo sits on a MacBook that travels everywhere I go.
              Conferences, coworking spaces, coffee shops. Real visibility, no algorithms.
            </p>
          </div>
        </div>

        {/* Image placeholder */}
        <div className="order-1 md:order-2 aspect-[4/3] rounded-2xl bg-white border border-[var(--hairline)] flex items-center justify-center">
          <span className="text-[14px] text-[var(--ink-3)]">Photo coming soon</span>
        </div>
      </div>
    </section>
  );
}
