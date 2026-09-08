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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
      <div className="relative max-w-[80rem] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <a href="/" className="text-xl font-semibold text-[var(--ink)] hover:opacity-80 transition-opacity">
          PulseSticker
        </a>

        {/* Center links */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          <button onClick={() => scrollTo('spots')} className="flex items-center px-3 h-full font-semibold text-base text-[var(--ink-2)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]">
            Spots
          </button>
          <button onClick={() => scrollTo('how-it-works')} className="flex items-center px-3 h-full font-semibold text-base text-[var(--ink-2)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]">
            How it works
          </button>
          <button onClick={() => scrollTo('faq')} className="flex items-center px-3 h-full font-semibold text-base text-[var(--ink-2)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]">
            FAQ
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hidden md:inline-flex items-center justify-center rounded-[14px] text-base font-semibold transition-all duration-300 border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--surface)] active:bg-[var(--surface)] h-10 px-4 hover:scale-[1.04] active:scale-[0.92]"
          >
            Learn more
          </button>
          <button
            onClick={onBidClick}
            className="inline-flex items-center justify-center rounded-[14px] text-base font-semibold transition-all duration-300 bg-[var(--ink)] text-white hover:opacity-90 h-10 px-4 hover:scale-[1.04] active:scale-[0.92] max-md:px-3 max-md:text-sm"
          >
            Claim a spot
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--surface)] transition-all duration-300"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 18V20H6V18H18ZM21 11V13H3V11H21ZM18 4V6H6V4H18Z"></path></svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white px-4 py-3 space-y-3">
          <button onClick={() => scrollTo('spots')} className="block text-base font-semibold text-[var(--ink-2)]">Spots</button>
          <button onClick={() => scrollTo('how-it-works')} className="block text-base font-semibold text-[var(--ink-2)]">How it works</button>
          <button onClick={() => scrollTo('faq')} className="block text-base font-semibold text-[var(--ink-2)]">FAQ</button>
        </div>
      )}
    </nav>
  );
}
