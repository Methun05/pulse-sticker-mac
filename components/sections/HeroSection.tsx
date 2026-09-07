'use client';

import React from 'react';
import { CountUp } from '@/components/ui/CountUp';
import { FoilButton } from '@/components/ui/FoilButton';

interface HeroSectionProps {
  onBidClick: () => void;
  totalRaised: number;
  occupiedCount: number;
}

export function HeroSection({ onBidClick, totalRaised, occupiedCount }: HeroSectionProps) {
  return (
    <section className="pt-16 sm:pt-24 pb-14 px-4 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* The number that screams */}
        <div className="mb-6">
          <CountUp
            value={totalRaised}
            className="text-[60px] font-bold tracking-[-0.04em] leading-none text-white"
          />
          <p className="mt-2 text-[14px] text-white/40 tracking-wide uppercase">
            raised so far{occupiedCount > 0 ? ` · ${occupiedCount} spot${occupiedCount !== 1 ? 's' : ''} claimed` : ''}
          </p>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-bold tracking-[-0.04em] leading-[1.1] text-white">
          Get your brand on this MacBook.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-[15px] sm:text-[17px] text-white/60 leading-relaxed max-w-[46ch] mx-auto">
          10 sticker spots on a real MacBook lid. Pay crypto to claim yours.
          Anyone can outbid you anytime — highest bidder holds the spot.
        </p>

        {/* Single CTA */}
        <div className="mt-8 flex justify-center">
          <FoilButton onClick={onBidClick}>
            Claim a spot
          </FoilButton>
        </div>

        {/* Token badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-white/40">
          <span>Accepts:</span>
          {['USDC', 'USDT', 'DAI'].map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-white/[0.08] font-medium text-white/60">{t}</span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-white/[0.08] font-medium text-white/60">5 chains</span>
        </div>
      </div>
    </section>
  );
}
