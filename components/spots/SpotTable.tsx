'use client';

import React from 'react';
import Link from 'next/link';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { BlockieAvatar } from '@/components/ui/BlockieAvatar';

interface SpotTableProps {
  spots: SpotData[];
  onBidClick: (spot: SpotData) => void;
}

export function SpotTable({ spots, onBidClick }: SpotTableProps) {
  const sorted = [...spots].sort((a, b) => {
    if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
    return a.number - b.number;
  });

  return (
    <div className="mx-auto w-full max-w-[860px] px-4">
      <h2 className="text-[18px] font-semibold text-[var(--ink)] mb-4 px-1">Leaderboard</h2>

      <div className="flex flex-col">
        {sorted.map((spot, index) => {
          const isOccupied = spot.currentBid > 0 && spot.brandName;
          const rank = index + 1;
          const minNextBid = isOccupied
            ? spot.currentBid + 1
            : spot.startingPrice;

          return (
            <div key={spot.id}>
              {index > 0 && (
                <div className="mx-1 border-t border-[var(--hairline)]/40" />
              )}
              <div className="flex w-full items-center gap-3 py-3 px-1">
                {/* Rank */}
                <span className="shrink-0 w-6 text-[14px] font-semibold text-[var(--ink-3)] tabular-nums">
                  #{rank}
                </span>

                {/* Avatar */}
                <div className="shrink-0">
                  {isOccupied ? (
                    spot.logoUrl ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--surface)]">
                        <img
                          src={spot.logoUrl}
                          alt={spot.brandName || ''}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <BlockieAvatar seed={spot.brandName || spot.id} />
                    )
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--surface)] flex items-center justify-center">
                      <span className="text-[13px] font-medium text-[var(--ink-3)]">
                        {spot.number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + position */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-semibold text-[var(--ink)] text-[14px] sm:text-[15px]">
                    {isOccupied ? spot.brandName : `Spot #${spot.number}`}
                  </p>
                  <p className="truncate text-[12px] sm:text-[13px] text-[var(--ink-3)]">
                    {spot.position}
                  </p>
                </div>

                {/* Bid amount */}
                <div className="shrink-0 text-right mr-1">
                  <p className="text-[15px] font-semibold text-[var(--ink)]">
                    ${isOccupied ? spot.currentBid : spot.startingPrice}
                  </p>
                </div>

                {/* Action: text link style */}
                <button
                  onClick={() => onBidClick(spot)}
                  className="shrink-0 text-[13px] font-medium text-[var(--ink)] hover:underline cursor-pointer whitespace-nowrap"
                >
                  {isOccupied ? `Outbid · $${minNextBid}` : `Bid · $${minNextBid}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History link */}
      <div className="text-center mt-4">
        <Link
          href="/history"
          className="text-[13px] text-[var(--accent)] font-medium hover:underline"
        >
          View full bid history →
        </Link>
      </div>
    </div>
  );
}
