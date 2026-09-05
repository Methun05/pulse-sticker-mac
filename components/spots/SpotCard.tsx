'use client';

import React from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';

const SIZE_BADGE: Record<string, { label: string; color: string }> = {
  'XL': { label: 'XL', color: 'bg-[var(--blue)]/10 text-[var(--blue)]' },
  'Large': { label: 'L', color: 'bg-[var(--green)]/10 text-[var(--green)]' },
  'Medium': { label: 'M', color: 'bg-[var(--amber)]/10 text-[var(--amber)]' },
  'Small': { label: 'S', color: 'bg-[var(--ink-3)]/10 text-[var(--ink-3)]' },
};

interface SpotCardProps {
  spot: SpotData;
  onBidClick: (spot: SpotData) => void;
}

export function SpotCard({ spot, onBidClick }: SpotCardProps) {
  const isOccupied = spot.currentBid > 0 && spot.brandName;
  const badge = SIZE_BADGE[spot.size] || SIZE_BADGE['Medium'];

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-white hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--ink)]">#{spot.number}</span>
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <span className="text-[12px] text-[var(--ink-3)]">{spot.position}</span>
      </div>

      {isOccupied ? (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            {spot.logoUrl && (
              <img src={spot.logoUrl} alt={spot.brandName || ''} className="w-6 h-6 rounded object-contain" />
            )}
            <span className="text-[14px] font-semibold text-[var(--ink)] truncate">
              {spot.brandName}
            </span>
          </div>
          {spot.website && (
            <a href={spot.website} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--blue)] hover:underline truncate block">
              {spot.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <span className="text-[13px] text-[var(--ink-3)]">No bids yet</span>
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em]">
            {isOccupied ? 'Current bid' : 'Starting at'}
          </div>
          <div className="text-[20px] font-bold tracking-[-0.02em] text-[var(--ink)]">
            ${isOccupied ? spot.currentBid : spot.startingPrice}
          </div>
        </div>
        <button
          onClick={() => onBidClick(spot)}
          className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
            isOccupied
              ? 'border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white'
              : 'bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)]'
          }`}
        >
          {isOccupied ? 'Outbid' : 'Bid now'}
        </button>
      </div>

      {spot.bidCount > 0 && (
        <div className="mt-2 text-[11px] text-[var(--ink-3)]">
          {spot.bidCount} bid{spot.bidCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
