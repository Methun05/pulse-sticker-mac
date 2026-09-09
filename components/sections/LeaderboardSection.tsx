'use client';

import React, { useState } from 'react';
import { LidView, InsideView, SpotData } from '@/components/laptop/MacBookMockup';
import { SpotTable } from '@/components/spots/SpotTable';

interface LeaderboardSectionProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function LeaderboardSection({ spots, onSelectSpot }: LeaderboardSectionProps) {
  const [view, setView] = useState<'lid' | 'inside'>('lid');

  return (
    <section className="pb-8 sm:pb-12">
      {/* MacBook mockup */}
      <div className="mx-auto w-full max-w-[860px] px-4">
        {view === 'lid' ? (
          <LidView spots={spots} onSelectSpot={onSelectSpot} />
        ) : (
          <InsideView spots={spots} onSelectSpot={onSelectSpot} />
        )}

        {/* Toggle below mockup */}
        <div className="flex justify-center mt-5">
          <div
            role="group"
            aria-label="View"
            className="flex rounded-full p-1 text-[13px] font-medium"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            {(['lid', 'inside'] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  view === key
                    ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.14)] ring-1 ring-black/10'
                    : 'text-[#56565c] hover:text-[#1d1d1f]'
                }`}
              >
                {key === 'lid' ? 'Lid' : 'Inside'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spot table */}
      <div className="pt-8 sm:pt-12">
        <SpotTable spots={spots} onBidClick={onSelectSpot} />
      </div>
    </section>
  );
}
