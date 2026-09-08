'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
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
    <section className="pt-16 pb-12 px-4 sm:px-6 text-center">
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
                className="h-full rounded-full bg-gradient-to-r from-[#00BFFF] via-[#8B5CF6] to-[#EC4899] animate-progress-fill"
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
          <a href="/manifesto" className="group inline-flex items-center gap-2 text-[14px] font-medium text-[var(--ink-3)] hover:text-[var(--ink-2)] transition-colors">
            <span className="flex flex-col gap-1">
              <span>Support the mission</span>
              <span className="h-px w-full origin-left scale-x-0 bg-[var(--ink-3)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
            </span>
            <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
