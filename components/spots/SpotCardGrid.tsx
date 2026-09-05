'use client';

import React from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { SpotCard } from './SpotCard';

interface SpotCardGridProps {
  spots: SpotData[];
  onBidClick: (spot: SpotData) => void;
}

export function SpotCardGrid({ spots, onBidClick }: SpotCardGridProps) {
  return (
    <div id="spots" className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[var(--ink)]">
            10 spots, one MacBook
          </h2>
          <p className="mt-2 text-[15px] text-[var(--ink-2)]">
            Pick a spot, pay crypto, your logo goes on the lid.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} onBidClick={onBidClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
