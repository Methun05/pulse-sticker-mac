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
    <section className="pt-16 sm:pt-24 pb-14 px-4 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Social proof pill */}
        {totalRaised > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[13px] text-white/60 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff55]" />
            ${totalRaised.toLocaleString()} raised across {occupiedCount} spot{occupiedCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Headline */}
        <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-bold tracking-[-0.04em] leading-[1.1] text-white">
          Get your brand on this MacBook.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-[15px] sm:text-[17px] text-white/60 leading-relaxed max-w-[46ch] mx-auto">
          10 sticker spots on a real MacBook lid. Pay crypto to claim yours.
          Anyone can outbid you anytime — highest bidder holds the spot.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBidClick}
            className="rounded-full bg-[#00ff55] hover:bg-[#00ff99] text-[#0A0B0E] px-6 py-3 text-[15px] font-medium transition-colors w-full sm:w-auto"
          >
            Claim a spot
          </button>
          <button
            onClick={onExploreSpots}
            className="rounded-full border border-white/20 hover:border-white/40 text-white px-6 py-3 text-[15px] font-medium transition-colors w-full sm:w-auto"
          >
            Explore spots
          </button>
        </div>

        {/* Token badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-white/40">
          <span>Accepts:</span>
          {['USDC', 'USDT', 'DAI'].map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-white/8 font-medium text-white/60">{t}</span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-white/8 font-medium text-white/60">5 chains</span>
        </div>
      </div>
    </section>
  );
}
