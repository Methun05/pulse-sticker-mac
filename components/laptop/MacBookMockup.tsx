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

// 6-col × 3-row grid matching brandmylaptop's layout
// Each spot has col/row/colSpan positioning + physical dimensions
const SPOT_LAYOUT: Record<number, { col: number; row: number; colSpan: number; sizeLabel: string; dims: string }> = {
  1:  { col: 1, row: 1, colSpan: 2, sizeLabel: 'L',  dims: '9.5 × 5.5 cm' },
  2:  { col: 3, row: 1, colSpan: 2, sizeLabel: 'L',  dims: '9.5 × 5.5 cm' },
  3:  { col: 5, row: 1, colSpan: 2, sizeLabel: 'L',  dims: '9.5 × 5.5 cm' },
  4:  { col: 1, row: 2, colSpan: 1, sizeLabel: 'S',  dims: '4.5 × 4.5 cm' },
  5:  { col: 2, row: 2, colSpan: 1, sizeLabel: 'S',  dims: '4.5 × 4.5 cm' },
  6:  { col: 3, row: 2, colSpan: 2, sizeLabel: 'L',  dims: '6.0 × 6.0 cm' },
  7:  { col: 5, row: 2, colSpan: 1, sizeLabel: 'S',  dims: '4.5 × 4.5 cm' },
  8:  { col: 6, row: 2, colSpan: 1, sizeLabel: 'S',  dims: '4.5 × 4.5 cm' },
  9:  { col: 1, row: 3, colSpan: 3, sizeLabel: 'M',  dims: '14.5 × 4.0 cm' },
  10: { col: 4, row: 3, colSpan: 3, sizeLabel: 'M',  dims: '14.5 × 4.0 cm' },
};

const SIZE_COLORS: Record<string, string> = {
  L: 'text-[#0071e3]',
  M: 'text-[#d97706]',
  S: 'text-[#86868b]',
};

interface MacBookMockupProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function MacBookMockup({ spots, onSelectSpot }: MacBookMockupProps) {
  return (
    <div className="max-w-[640px] mx-auto px-4" style={{ containerType: 'inline-size' }}>
      {/* === Lid === */}
      <div
        className="relative rounded-t-[12px] overflow-hidden"
        style={{
          aspectRatio: '1.44',
          background: 'linear-gradient(180deg, #e8e8ed 0%, #d8d8dd 40%, #c8c8cd 100%)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {/* Bezel */}
        <div className="absolute inset-[3%] rounded-[6px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #ededf0 0%, #dddde2 50%, #cdcdd3 100%)',
          }}
        >
          {/* Spot grid */}
          <div
            className="absolute inset-[4%] grid grid-cols-6 gap-[2.5%]"
            style={{ gridAutoRows: '1fr' }}
          >
            {spots.map(spot => {
              const layout = SPOT_LAYOUT[spot.number];
              if (!layout) return null;
              const isOccupied = spot.currentBid > 0 && spot.brandName;
              const sizeColor = SIZE_COLORS[layout.sizeLabel] || SIZE_COLORS.S;

              return (
                <button
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className={`
                    relative rounded-[6px] transition-all cursor-pointer
                    flex flex-col items-center justify-center text-center
                    ${isOccupied
                      ? 'bg-white/95 border border-[#0071e3]/20 hover:shadow-lg hover:scale-[1.02]'
                      : 'bg-white/60 border border-dashed border-[#1d1d1f]/12 hover:bg-white/85 hover:border-[#0071e3]/40'
                    }
                  `}
                  style={{
                    gridColumn: `${layout.col} / span ${layout.colSpan}`,
                    gridRow: layout.row,
                  }}
                >
                  {isOccupied ? (
                    <>
                      {spot.logoUrl ? (
                        <img
                          src={spot.logoUrl}
                          alt={spot.brandName || ''}
                          className="max-w-[60%] max-h-[50%] object-contain"
                        />
                      ) : (
                        <span className="text-[clamp(9px,2cqw,14px)] font-semibold text-[#1d1d1f] truncate max-w-[90%]">
                          {spot.brandName}
                        </span>
                      )}
                      <span className="text-[clamp(8px,1.5cqw,11px)] text-[#1a7f37] font-medium mt-[2px]">
                        ${spot.currentBid}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`text-[clamp(8px,1.4cqw,11px)] font-medium ${sizeColor} opacity-70`}>
                        {layout.sizeLabel} · #{spot.number}
                      </span>
                      <span className="text-[clamp(11px,2.2cqw,18px)] font-bold text-[#1d1d1f] tracking-[-0.02em]">
                        ${spot.startingPrice}
                      </span>
                      <span className="text-[clamp(7px,1.2cqw,10px)] text-[#86868b]">
                        {layout.dims}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Apple logo — visible only when center spot (#6) is empty */}
          {spots.find(s => s.number === 6 && s.currentBid === 0) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06] z-0">
              <svg width="40" height="48" viewBox="0 0 170 200" fill="#1d1d1f">
                <path d="M119.8 44.2c-3.4-8.5-8.2-15.8-14.8-21.1C98.5 17.5 91 14.5 82.5 14.5c-5.5 0-10.7 1.2-15.3 3.5-4.3 2.1-8 4.8-10.6 7.3-2.6-2.5-6.3-5.2-10.6-7.3-4.6-2.3-9.8-3.5-15.3-3.5-8.5 0-16 3-22.5 8.6C1.6 29.4-3 36.7-6.4 45.2c-3.7 9.2-5.5 19.3-5.5 30.3 0 13.5 3 27.3 9 41.3 5.5 12.8 12.7 24.3 21.6 34.3 8.2 9.2 16.2 16.2 24.1 20.8 6.5 3.8 11.8 5.7 13.7 5.7 1.9 0 7.2-1.9 13.7-5.7 7.9-4.6 15.9-11.6 24.1-20.8 8.9-10 16.1-21.5 21.6-34.3 6-14 9-27.8 9-41.3 0-11-1.8-21.1-5.5-30.3z" transform="translate(85,100) scale(0.85)"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* === Hinge === */}
      <div className="relative mx-auto" style={{ width: '104%', marginLeft: '-2%' }}>
        <div
          className="h-[6px] rounded-b-[2px]"
          style={{
            background: 'linear-gradient(180deg, #b0b0b5 0%, #a0a0a5 50%, #909095 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* === Base === */}
      <div className="relative mx-auto" style={{ width: '108%', marginLeft: '-4%' }}>
        <div
          className="h-[3px] rounded-b-[4px]"
          style={{
            background: 'linear-gradient(180deg, #c0c0c5 0%, #b0b0b5 100%)',
          }}
        />
      </div>
    </div>
  );
}
