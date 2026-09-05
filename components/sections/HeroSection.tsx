'use client';

import React from 'react';

interface HeroSectionProps {
  onBidClick: () => void;
  onExploreSpots: () => void;
  totalRaised: number;
  occupiedCount: number;
}

export function HeroSection({ onBidClick, onExploreSpots, totalRaised, occupiedCount }: HeroSectionProps) {
  return (
    <section className="pt-16 sm:pt-24 pb-10 px-4 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Social proof pill */}
        {totalRaised > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[13px] text-[var(--ink-2)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
            ${totalRaised.toLocaleString()} raised across {occupiedCount} spot{occupiedCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Headline */}
        <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-bold tracking-[-0.04em] leading-[1.1] text-[var(--ink)]">
          Get your brand on this MacBook.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-[15px] sm:text-[17px] text-[var(--ink-2)] leading-relaxed max-w-[46ch] mx-auto">
          10 sticker spots on a real MacBook lid. Pay crypto to claim yours.
          Anyone can outbid you anytime — highest bidder holds the spot.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBidClick}
            className="rounded-full bg-[var(--blue)] hover:bg-[var(--blue-hover)] text-white px-6 py-3 text-[15px] font-medium transition-colors w-full sm:w-auto"
          >
            Claim a spot
          </button>
          <button
            onClick={onExploreSpots}
            className="rounded-full border border-[var(--hairline)] hover:border-[var(--ink-3)] px-6 py-3 text-[15px] font-medium transition-colors w-full sm:w-auto"
          >
            Explore spots
          </button>
        </div>

        {/* Token badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[var(--ink-3)]">
          <span>Accepts:</span>
          {['USDC', 'USDT', 'DAI'].map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-[var(--surface)] font-medium">{t}</span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] font-medium">5 chains</span>
        </div>
      </div>
    </section>
  );
}
