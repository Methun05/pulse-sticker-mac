'use client';

import React from 'react';

export interface SpotData {
  id: string;
  number: number;
  position: string;
  size: string;
  startingPrice: number;
  currentBid: number;
  brandName: string | null;
  logoUrl: string | null;
  website: string | null;
  status: string;
  bidCount: number;
  clicksCount: number;
}

// Grid layout: 6 columns x 3 rows on the MacBook lid
const SPOT_GRID: Record<number, { col: string; row: number; label: string; dims: string }> = {
  1: { col: '1 / span 2', row: 1, label: 'Top left', dims: '10.8 × 6.3 cm' },
  2: { col: '3 / span 2', row: 1, label: 'Top center', dims: '10.8 × 6.3 cm' },
  3: { col: '5 / span 2', row: 1, label: 'Top right', dims: '10.8 × 6.3 cm' },
  4: { col: '1 / span 1', row: 2, label: 'Mid left', dims: '5.1 × 5.1 cm' },
  5: { col: '2 / span 1', row: 2, label: 'Mid left-center', dims: '5.1 × 5.1 cm' },
  6: { col: '3 / span 2', row: 2, label: 'Center', dims: '6.8 × 6.8 cm' },
  7: { col: '5 / span 1', row: 2, label: 'Mid right-center', dims: '5.1 × 5.1 cm' },
  8: { col: '6 / span 1', row: 2, label: 'Mid right', dims: '5.1 × 5.1 cm' },
  9: { col: '1 / span 3', row: 3, label: 'Bottom left', dims: '10.8 × 4.6 cm' },
  10: { col: '4 / span 3', row: 3, label: 'Bottom right', dims: '10.8 × 4.6 cm' },
};

interface MacBookMockupProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function MacBookMockup({ spots, onSelectSpot }: MacBookMockupProps) {
  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Laptop lid */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[var(--lid-1)] to-[var(--lid-3)] p-3 sm:p-4 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
        {/* Apple logo area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 opacity-[0.15] pointer-events-none z-0">
          <svg viewBox="0 0 170 210" fill="currentColor" className="text-[var(--ink)]">
            <path d="M150.4 71.4c-1-1-24.5-14.1-24.5-42.8 0-24.3 21.3-35.6 22.2-36.2-12.1-17.9-30.9-18.1-37.6-18.1-16 0-29.4 9.6-37.2 9.6-8.2 0-20-9.3-33-9.1C23.3-24.9 8.2-13 0 2.5c-16.8 31.1-4.3 77.1 11.8 102.3 8 11.8 17.5 25 30 24.5 12.1-.5 16.6-7.8 31.2-7.8 14.4 0 18.5 7.8 31.2 7.5 13-.2 21.2-11.8 29-23.7 9.2-13.5 12.9-26.6 13.2-27.3-.3-.1-25.3-9.8-25.5-38.8z"/>
          </svg>
        </div>

        {/* Spot grid */}
        <div className="relative z-10 grid grid-cols-6 gap-1.5 sm:gap-2" style={{ gridAutoRows: 'minmax(60px, 1fr)' }}>
          {spots.map(spot => {
            const grid = SPOT_GRID[spot.number];
            if (!grid) return null;
            const isOccupied = spot.currentBid > 0 && spot.brandName;

            return (
              <button
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className={`
                  relative rounded-lg border-2 border-dashed transition-all cursor-pointer
                  flex flex-col items-center justify-center text-center p-1.5 sm:p-2 min-h-[60px]
                  ${isOccupied
                    ? 'border-[var(--blue)]/30 bg-white/90 hover:bg-white hover:shadow-md'
                    : 'border-[var(--ink)]/10 bg-white/50 hover:bg-white/80 hover:border-[var(--blue)]/50 spot-available'
                  }
                `}
                style={{
                  gridColumn: grid.col,
                  gridRow: grid.row,
                }}
              >
                {isOccupied ? (
                  <>
                    {spot.logoUrl ? (
                      <img src={spot.logoUrl} alt={spot.brandName || ''} className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded" />
                    ) : (
                      <span className="text-[11px] sm:text-[13px] font-semibold text-[var(--ink)] truncate max-w-full px-1">
                        {spot.brandName}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-[var(--green)] font-medium mt-0.5">
                      ${spot.currentBid}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] sm:text-[11px] font-medium text-[var(--ink-3)]">
                      #{spot.number}
                    </span>
                    <span className="text-[11px] sm:text-[13px] font-semibold text-[var(--ink)]">
                      ${spot.startingPrice}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[var(--ink-3)]">
                      {spot.size}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Laptop hinge */}
      <div className="mx-auto w-[110%] -ml-[5%] h-3 bg-gradient-to-b from-[#b8b8bd] to-[#a8a8ad] rounded-b-lg" />
      {/* Laptop base */}
      <div className="mx-auto w-[115%] -ml-[7.5%] h-1.5 bg-[#c8c8cd] rounded-b-xl" />
    </div>
  );
}
