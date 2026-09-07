'use client';

import React, { useState } from 'react';

interface NavbarProps {
  onBidClick: () => void;
  totalRaised: number;
}

export function Navbar({ onBidClick, totalRaised }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--hairline)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-semibold text-[15px] tracking-[-0.01em]">
          <span className="w-7 h-7 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center text-xs font-bold">P</span>
          PulseSticker
        </a>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] text-[var(--ink-2)]">
          <button onClick={() => scrollTo('spots')} className="hover:text-[var(--ink)] transition-colors">Spots</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-[var(--ink)] transition-colors">How it works</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-[var(--ink)] transition-colors">FAQ</button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {totalRaised > 0 && (
            <span className="hidden sm:inline text-[13px] text-[var(--ink-3)] font-medium">
              ${totalRaised.toLocaleString()} raised
            </span>
          )}
          <button
            onClick={onBidClick}
            className="rounded-full bg-[var(--blue)] hover:bg-[var(--blue-hover)] text-white px-5 py-2 text-[14px] font-medium transition-colors"
          >
            Place a bid
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5"/></svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5"/></svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--hairline)] bg-white px-4 py-3 space-y-3">
          <button onClick={() => scrollTo('spots')} className="block text-[15px] text-[var(--ink-2)]">Spots</button>
          <button onClick={() => scrollTo('how-it-works')} className="block text-[15px] text-[var(--ink-2)]">How it works</button>
          <button onClick={() => scrollTo('faq')} className="block text-[15px] text-[var(--ink-2)]">FAQ</button>
        </div>
      )}
    </nav>
  );
}
