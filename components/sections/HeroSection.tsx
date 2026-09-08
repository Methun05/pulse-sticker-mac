'use client';

import React from 'react';
import { CountUp } from '@/components/ui/CountUp';
import { FoilButton } from '@/components/ui/FoilButton';

const FUNDING_GOAL = 500;

interface HeroSectionProps {
  onBidClick: () => void;
  totalRaised: number;
  occupiedCount: number;
}

export function HeroSection({ onBidClick, totalRaised, occupiedCount }: HeroSectionProps) {
  return (
    <section className="pt-20 pb-14 px-4 sm:px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* The number that screams */}
        <div className="mb-6">
          <CountUp
            value={200}
            className="text-[80px] sm:text-[100px] font-bold tracking-[-0.04em] leading-none text-[var(--ink)]"
          />
          <div className="mt-3 max-w-sm mx-auto">
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--ink-2)]">$200 raised</span>
              <span className="text-[var(--ink-3)]">goal ${FUNDING_GOAL}</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00BFFF] via-[#8B5CF6] to-[#EC4899]"
                style={{ width: `${Math.min((200 / FUNDING_GOAL) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-medium tracking-[-0.04em] leading-[1.1] text-[var(--ink)]">
          Taking PulseChain to every<br />corner of the world.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-[15px] sm:text-[17px] text-[var(--ink-2)] leading-relaxed max-w-[50ch] mx-auto">
          Promote your PulseChain project on my MacBook and support a community-driven mission to bring PulseChain into the real world.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <FoilButton onClick={onBidClick}>
            Claim a spot
          </FoilButton>
          <a href="/manifesto" className="text-[14px] text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink-2)] transition-colors">
            Support the mission
          </a>
        </div>

      </div>
    </section>
  );
}
