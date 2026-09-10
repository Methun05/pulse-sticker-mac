'use client';

import React from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { BlockieAvatar } from '@/components/ui/BlockieAvatar';

interface AnnouncementBarProps {
  spots: SpotData[];
}

export function AnnouncementBar({ spots }: AnnouncementBarProps) {
  const occupied = spots.filter(s => s.currentBid > 0 && s.brandName);

  if (occupied.length === 0) return null;

  // Build announcement items
  const items = occupied.map(s => ({
    brand: s.brandName!,
    spot: s.number,
    amount: s.currentBid,
    logoUrl: s.logoUrl,
    id: s.id,
  }));

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-b border-[var(--hairline)] bg-[var(--surface)]">
      <div
        className="flex items-center gap-8 py-2.5 whitespace-nowrap animate-ticker"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2 text-[13px]">
            <div className="shrink-0">
              {item.logoUrl ? (
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white">
                  <img src={item.logoUrl} alt="" className="w-full h-full object-contain" />
                </div>
              ) : (
                <BlockieAvatar seed={item.brand} size={20} />
              )}
            </div>
            <span className="font-semibold text-[var(--ink)]">{item.brand}</span>
            <span className="text-[var(--ink-3)]">claimed Spot #{item.spot} for</span>
            <span className="font-semibold text-[var(--green)]">${item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
