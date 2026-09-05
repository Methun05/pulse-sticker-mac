'use client';

import React, { useEffect, useRef } from 'react';

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

// ── Exact layout from brandmylaptop: 6-col × 3-row grid ──
const SPOT_LAYOUT: Record<
  number,
  { col: number; row: number; colSpan: number; sizeLabel: string; dims: string }
> = {
  1:  { col: 1, row: 1, colSpan: 2, sizeLabel: 'LARGE',  dims: '9.5 × 5.5 cm' },
  2:  { col: 3, row: 1, colSpan: 2, sizeLabel: 'LARGE',  dims: '9.5 × 5.5 cm' },
  3:  { col: 5, row: 1, colSpan: 2, sizeLabel: 'LARGE',  dims: '9.5 × 5.5 cm' },
  4:  { col: 1, row: 2, colSpan: 1, sizeLabel: 'SMALL',  dims: '4.5 × 4.5 cm' },
  5:  { col: 2, row: 2, colSpan: 1, sizeLabel: 'SMALL',  dims: '4.5 × 4.5 cm' },
  6:  { col: 5, row: 2, colSpan: 1, sizeLabel: 'SMALL',  dims: '4.5 × 4.5 cm' },
  7:  { col: 6, row: 2, colSpan: 1, sizeLabel: 'SMALL',  dims: '4.5 × 4.5 cm' },
  8:  { col: 1, row: 3, colSpan: 2, sizeLabel: 'MEDIUM', dims: '9.5 × 4.0 cm' },
  9:  { col: 3, row: 3, colSpan: 2, sizeLabel: 'MEDIUM', dims: '9.5 × 4.0 cm' },
  10: { col: 5, row: 3, colSpan: 2, sizeLabel: 'MEDIUM', dims: '9.5 × 4.0 cm' },
};

// ── Exact lid finish colors from brandmylaptop CSS vars ──
// Silver finish: --lid-1:#ececed  --lid-2:#dcdcdf  --lid-3:#c8c8cd
const LID_STOPS = ['#ececed', '#dcdcdf', '#c8c8cd'];

// Apple logo SVG (exact path from brandmylaptop source)
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 39" className={className} fill="currentColor">
      <path d="M22.152 0c.28 2.074-.602 4.109-1.835 5.643-1.266 1.498-3.37 2.66-5.392 2.507-.324-1.89.715-3.903 1.9-5.325C18.11 1.273 20.366.145 22.152 0zM28.56 28.506c-.79 1.73-1.17 2.502-2.19 4.042-1.422 2.148-3.426 4.82-5.908 4.843-2.204.023-2.77-1.434-5.76-1.413-2.988.018-3.613 1.44-5.82 1.42-2.48-.024-4.378-2.442-5.8-4.59C-.26 28.06-1.043 21.78 1.47 18.373 3.27 15.93 5.942 14.47 8.43 14.47c2.459 0 4.004 1.44 6.038 1.44 1.973 0 3.176-1.443 6.022-1.443 2.213 0 4.587 1.204 6.384 3.283-5.608 3.074-4.698 11.08.686 12.756z" />
    </svg>
  );
}

interface MacBookMockupProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function MacBookMockup({ spots, onSelectSpot }: MacBookMockupProps) {
  const lidRef = useRef<HTMLDivElement>(null);

  // ── Responsive --lidw variable (exact from brandmylaptop) ──
  useEffect(() => {
    const el = lidRef.current;
    if (!el) return;
    const sync = () =>
      el.style.setProperty('--lidw', `${el.getBoundingClientRect().width}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Is center (Apple logo area) occupied?
  const centerOccupied = spots.some(
    (s) => s.number >= 5 && s.number <= 6 && s.currentBid > 0 && s.brandName
  );

  return (
    <div className="mx-auto w-full max-w-[860px]" style={{ containerType: 'inline-size' }}>
      {/* ═══ Lid ═══ */}
      <div
        ref={lidRef}
        className="relative w-full"
        style={{
          aspectRatio: '1.44',
          borderRadius: 'calc(var(--lidw, 100cqw) * 0.026)',
          padding: 'calc(var(--lidw, 100cqw) * 0.012)',
          background: `linear-gradient(172deg, ${LID_STOPS[0]} 0%, ${LID_STOPS[1]} 45%, ${LID_STOPS[2]} 100%)`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 30px 60px -18px rgba(0,0,0,0.28), 0 12px 24px -12px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* ── Specular highlight overlay (the subtle shine) ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: 'inherit',
            background:
              'radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 42%, transparent 70%)',
          }}
        />

        {/* ── Apple logo (shown when center spots are empty) ── */}
        {!centerOccupied && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[15.6%]">
              <AppleLogo className="w-full text-[#3b3b3f] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.6))]" />
            </div>
          </div>
        )}

        {/* ── Spot grid ── */}
        <div
          className="relative z-20 h-full w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gridTemplateRows: 'minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 1fr)',
            gap: 'calc(var(--lidw, 100cqw) * 0.014)',
            padding: 'calc(var(--lidw, 100cqw) * 0.019)',
          }}
        >
          {spots.map((spot) => {
            const layout = SPOT_LAYOUT[spot.number];
            if (!layout) return null;
            const isOccupied = spot.currentBid > 0 && spot.brandName;

            return (
              <div
                key={spot.id}
                style={{
                  gridColumn: `${layout.col} / span ${layout.colSpan}`,
                  gridRow: layout.row,
                }}
              >
                {isOccupied ? (
                  /* ── Sold spot ── */
                  <button
                    onClick={() => onSelectSpot(spot)}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[calc(var(--lidw,100cqw)*0.014)] transition-opacity hover:opacity-75 cursor-pointer"
                  >
                    {spot.logoUrl ? (
                      <img
                        src={spot.logoUrl}
                        alt={spot.brandName || ''}
                        loading="lazy"
                        decoding="async"
                        className="max-h-[56%] max-w-[88%] shrink-0 object-contain"
                      />
                    ) : (
                      <span
                        className="max-w-full text-center font-semibold leading-tight text-[#1d1d1f] [overflow-wrap:anywhere]"
                        style={{ fontSize: 'calc(var(--lidw, 100cqw) * 0.016)' }}
                      >
                        {spot.brandName}
                      </span>
                    )}
                    <span
                      className="font-medium text-[#1a7f37]"
                      style={{ fontSize: 'calc(var(--lidw, 100cqw) * 0.013)' }}
                    >
                      ${spot.currentBid}
                    </span>
                  </button>
                ) : (
                  /* ── Empty spot (for sale) ── */
                  <button
                    onClick={() => onSelectSpot(spot)}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[calc(var(--lidw,100cqw)*0.014)] border border-dashed border-black/15 transition-all hover:border-black/30 hover:bg-white/10"
                  >
                    <span
                      className="font-medium uppercase tracking-wide text-[#1d1d1f]/50"
                      style={{ fontSize: 'calc(var(--lidw, 100cqw) * 0.013)' }}
                    >
                      {layout.sizeLabel}
                    </span>
                    <span
                      className="font-semibold tabular-nums text-[#1d1d1f]"
                      style={{ fontSize: 'calc(var(--lidw, 100cqw) * 0.016)' }}
                    >
                      {spot.startingPrice} $
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
