'use client';

import React from 'react';

export function MyMacBookSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Image placeholder */}
        <div className="aspect-[4/3] rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] flex items-center justify-center">
          <span className="text-[14px] text-[var(--ink-3)]">Photo coming soon</span>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mb-4">
            This is my actual MacBook
          </h2>
          <div className="space-y-3 text-[15px] text-[var(--ink-2)] leading-relaxed">
            <p>
              Not a render. Not a mockup. Every sticker on this laptop is real,
              printed and placed by hand.
            </p>
            <p>
              It goes with me to meetups, coworking spaces, cafes, and events.
              Your project gets seen by real people, in real life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
