'use client';

import React from 'react';
import Link from 'next/link';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { BlockieAvatar } from '@/components/ui/BlockieAvatar';

// Dummy data for development — remove when real bids exist
const DUMMY_SPOTS: SpotData[] = [
  { id: 'd1', number: 1, position: 'Center Lid', size: 'XL', startingPrice: 5, currentBid: 50, brandName: 'PulseX', logoUrl: '', website: 'https://pulsex.com', status: 'OCCUPIED', bidCount: 4, clicksCount: 0 },
  { id: 'd2', number: 2, position: 'Upper Left', size: 'L', startingPrice: 4, currentBid: 35, brandName: 'HEX', logoUrl: '', website: 'https://hex.com', status: 'OCCUPIED', bidCount: 3, clicksCount: 0 },
  { id: 'd3', number: 3, position: 'Upper Right', size: 'L', startingPrice: 4, currentBid: 25, brandName: 'Liquid Loans', logoUrl: '', website: '', status: 'OCCUPIED', bidCount: 1, clicksCount: 0 },
  { id: 'd4', number: 4, position: 'Mid Left Top', size: 'S', startingPrice: 2, currentBid: 15, brandName: 'PCOCK', logoUrl: '', website: '', status: 'OCCUPIED', bidCount: 6, clicksCount: 0 },
  { id: 'd5', number: 5, position: 'Mid Left Bottom', size: 'S', startingPrice: 2, currentBid: 0, brandName: '', logoUrl: '', website: '', status: 'AVAILABLE', bidCount: 0, clicksCount: 0 },
  { id: 'd6', number: 6, position: 'Mid Right Top', size: 'S', startingPrice: 2, currentBid: 10, brandName: 'SOIL', logoUrl: '', website: '', status: 'OCCUPIED', bidCount: 1, clicksCount: 0 },
  { id: 'd7', number: 7, position: 'Mid Right Bottom', size: 'S', startingPrice: 2, currentBid: 0, brandName: '', logoUrl: '', website: '', status: 'AVAILABLE', bidCount: 0, clicksCount: 0 },
  { id: 'd8', number: 8, position: 'Lower Left', size: 'M', startingPrice: 3, currentBid: 20, brandName: 'RichardSwap', logoUrl: '', website: '', status: 'OCCUPIED', bidCount: 5, clicksCount: 0 },
  { id: 'd9', number: 9, position: 'Lower Center', size: 'M', startingPrice: 3, currentBid: 0, brandName: '', logoUrl: '', website: '', status: 'AVAILABLE', bidCount: 0, clicksCount: 0 },
  { id: 'd10', number: 10, position: 'Lower Right', size: 'M', startingPrice: 3, currentBid: 12, brandName: 'Mintra', logoUrl: '', website: '', status: 'OCCUPIED', bidCount: 2, clicksCount: 0 },
];

interface SpotTableProps {
  spots: SpotData[];
  onBidClick: (spot: SpotData) => void;
}

export function SpotTable({ spots, onBidClick }: SpotTableProps) {
  const data = spots.length > 0 && spots.some(s => s.currentBid > 0) ? spots : DUMMY_SPOTS;
  const sorted = [...data].sort((a, b) => {
    if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
    return a.number - b.number;
  });

  return (
    <div className="mx-auto w-full max-w-[860px] px-4">
      <h2 className="text-[18px] font-semibold text-[var(--ink)] mb-3 px-1">All Spots</h2>

      <div
        className="rounded-2xl bg-white p-2"
        style={{
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 2px 0 rgba(0,0,0,0.01), 0 4px 4px 0 rgba(0,0,0,0.01), 0 2px 24px 0 rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex flex-col gap-0.5">
          {sorted.map((spot) => {
            const isOccupied = spot.currentBid > 0 && spot.brandName;
            const outbids = spot.bidCount > 1 ? spot.bidCount - 1 : 0;

            return (
              <div
                key={spot.id}
                className="flex w-full items-center gap-3 rounded-xl p-2 py-2.5 hover:bg-[#f5f5f7] transition-colors duration-300"
              >
                {/* Avatar: blockie for occupied, spot number for available */}
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
                      <span className="text-[13px] font-semibold text-[var(--ink-3)]">
                        {spot.number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + subtitle */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-semibold text-[var(--ink)] text-[14px] sm:text-[15px]">
                    {isOccupied ? spot.brandName : `Spot #${spot.number}`}
                  </p>
                  <p className="truncate text-[12px] sm:text-[13px] text-[var(--ink-3)]">
                    {isOccupied && outbids > 0
                      ? `${spot.position} · ${outbids} outbid${outbids !== 1 ? 's' : ''}`
                      : spot.position}
                  </p>
                </div>

                {/* Bid amount */}
                <div className="shrink-0 text-right mr-1">
                  <p className="text-[15px] font-semibold text-[var(--ink)]">
                    {isOccupied ? `$${spot.currentBid}` : `$${spot.startingPrice}`}
                  </p>
                  {!isOccupied && (
                    <p className="text-[11px] text-[var(--ink-3)]">starting</p>
                  )}
                </div>

                {/* Action button */}
                <button
                  onClick={() => onBidClick(spot)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                    isOccupied
                      ? 'border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white'
                      : 'bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)]'
                  }`}
                >
                  {isOccupied ? 'Outbid' : 'Bid'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* History link */}
      <div className="text-center mt-4">
        <Link
          href="/history"
          className="text-[13px] text-[var(--blue)] font-medium hover:underline"
        >
          View full bid history →
        </Link>
      </div>
    </div>
  );
}
