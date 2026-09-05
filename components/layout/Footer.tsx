'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[14px] text-[var(--ink-2)]">
            <span className="w-6 h-6 rounded-md bg-[var(--ink)] text-white flex items-center justify-center text-[10px] font-bold">P</span>
            <span className="font-medium text-[var(--ink)]">PulseSticker</span>
            <span className="text-[var(--ink-3)]">· PulseChain community leaderboard</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[var(--ink-3)]">
            <a href="#spots" className="hover:text-[var(--ink)] transition-colors">Spots</a>
            <a href="#how-it-works" className="hover:text-[var(--ink)] transition-colors">How it works</a>
            <a href="#faq" className="hover:text-[var(--ink)] transition-colors">FAQ</a>
          </div>
        </div>
        <p className="mt-6 text-center text-[12px] text-[var(--ink-3)]">
          Stickers are paid placements, not endorsements. PulseSticker is not affiliated with Apple Inc. or any token project listed.
        </p>
      </div>
    </footer>
  );
}
