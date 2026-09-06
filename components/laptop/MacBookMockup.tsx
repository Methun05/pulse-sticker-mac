'use client';

import React, { useEffect, useRef, useState } from 'react';

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

// ── Lid spot grid: 6-col × 3-row (exact from brandmylaptop) ──
const LID_SPOTS: Record<
  number,
  { col: number; row: number; colSpan: number; sizeLabel: string }
> = {
  1:  { col: 1, row: 1, colSpan: 2, sizeLabel: 'LARGE' },
  2:  { col: 3, row: 1, colSpan: 2, sizeLabel: 'LARGE' },
  3:  { col: 5, row: 1, colSpan: 2, sizeLabel: 'LARGE' },
  4:  { col: 1, row: 2, colSpan: 1, sizeLabel: 'SMALL' },
  5:  { col: 2, row: 2, colSpan: 1, sizeLabel: 'SMALL' },
  6:  { col: 5, row: 2, colSpan: 1, sizeLabel: 'SMALL' },
  7:  { col: 6, row: 2, colSpan: 1, sizeLabel: 'SMALL' },
  8:  { col: 1, row: 3, colSpan: 2, sizeLabel: 'MEDIUM' },
  9:  { col: 3, row: 3, colSpan: 2, sizeLabel: 'MEDIUM' },
  10: { col: 5, row: 3, colSpan: 2, sizeLabel: 'MEDIUM' },
};

// ── Inside spot grid: 3-col × 2-row on palm rest ──
const INSIDE_SPOTS = [
  { sizeLabel: 'LARGE' },
  { sizeLabel: 'LARGE' },
  { sizeLabel: 'LARGE' },
  { sizeLabel: 'SMALL' },
  { sizeLabel: 'SMALL' },
  { sizeLabel: 'SMALL' },
];

// Lid finish: --lid-1 / --lid-2 / --lid-3 from brandmylaptop CSS
const LID_STOPS = ['#ececed', '#dcdcdf', '#c8c8cd'];

// Apple logo (exact SVG path + viewBox from brandmylaptop module 20367)
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.033 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </svg>
  );
}

// ── Spot cell (shared between lid + inside views) ──
function SpotCell({
  spot,
  sizeLabel,
  cssVar,
  onSelect,
}: {
  spot: SpotData;
  sizeLabel: string;
  cssVar: string;
  onSelect: (s: SpotData) => void;
}) {
  const isOccupied = spot.currentBid > 0 && spot.brandName;

  if (isOccupied) {
    return (
      <button
        onClick={() => onSelect(spot)}
        className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[calc(var(--lidw,100cqw)*0.014)] cursor-pointer transition-opacity hover:opacity-75"
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
            style={{ fontSize: `calc(var(${cssVar}, 100cqw) * 0.016)` }}
          >
            {spot.brandName}
          </span>
        )}
        <span
          className="font-medium text-[#1a7f37]"
          style={{ fontSize: `calc(var(${cssVar}, 100cqw) * 0.013)` }}
        >
          ${spot.currentBid}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(spot)}
      className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[calc(var(--lidw,100cqw)*0.014)] border border-dashed border-black/15 transition-all hover:border-black/30 hover:bg-white/10"
    >
      <span
        className="font-medium uppercase tracking-wide text-[#1d1d1f]/50"
        style={{ fontSize: `calc(var(${cssVar}, 100cqw) * 0.013)` }}
      >
        {sizeLabel}
      </span>
      <span
        className="font-semibold tabular-nums text-[#1d1d1f]"
        style={{ fontSize: `calc(var(${cssVar}, 100cqw) * 0.016)` }}
      >
        ${spot.startingPrice}
      </span>
    </button>
  );
}

// ── Lid view: CSS gradient surface + spot grid (exact brandmylaptop pattern) ──
function LidView({
  spots,
  onSelectSpot,
}: {
  spots: SpotData[];
  onSelectSpot: (s: SpotData) => void;
}) {
  const lidRef = useRef<HTMLDivElement>(null);

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

  const centerOccupied = spots.some(
    (s) => s.number >= 5 && s.number <= 6 && s.currentBid > 0 && s.brandName
  );

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div
        ref={lidRef}
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1.44',
          borderRadius: 'calc(var(--lidw, 100cqw) * 0.026)',
          padding: 'calc(var(--lidw, 100cqw) * 0.012)',
          background: `linear-gradient(172deg, ${LID_STOPS[0]} 0%, ${LID_STOPS[1]} 45%, ${LID_STOPS[2]} 100%)`,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 30px 60px -18px rgba(0,0,0,0.28), 0 12px 24px -12px rgba(0,0,0,0.18)',
        }}
      >
        {/* Specular highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: 'inherit',
            background:
              'radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 42%, transparent 70%)',
          }}
        />

        {/* Apple logo */}
        {!centerOccupied && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[15.6%]">
              <AppleLogo className="w-full text-[#3b3b3f] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.6))]" />
            </div>
          </div>
        )}

        {/* Spot grid */}
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
            const layout = LID_SPOTS[spot.number];
            if (!layout) return null;
            return (
              <div
                key={spot.id}
                style={{
                  gridColumn: `${layout.col} / span ${layout.colSpan}`,
                  gridRow: layout.row,
                }}
              >
                <SpotCell
                  spot={spot}
                  sizeLabel={layout.sizeLabel}
                  onSelect={onSelectSpot}
                  cssVar="--lidw"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Inside view: real MacBook photo + spots around trackpad ──
// Photo measured: 1553×1013px. Palm rest zones calculated from pixel positions.
function InsideView({
  spots,
  onSelectSpot,
}: {
  spots: SpotData[];
  onSelectSpot: (s: SpotData) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () =>
      el.style.setProperty('--basew', `${el.getBoundingClientRect().width}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Split spots into zones around the trackpad:
  // Top strip (3 spots): full width above trackpad
  // Left of trackpad (2 spots): stacked vertically
  // Right of trackpad (2 spots): stacked vertically
  const topSpots = spots.slice(0, 3);    // spots 1-3
  const leftSpots = spots.slice(3, 5);   // spots 4-5
  const rightSpots = spots.slice(5, 7);  // spots 6-7
  const bottomSpots = spots.slice(7, 10); // spots 8-10

  const gap = 'calc(var(--basew, 100cqw) * 0.008)';

  return (
    <div ref={ref} className="relative" style={{ containerType: 'inline-size' }}>
      <img
        src="/macbook-inside.webp"
        alt="MacBook open from above"
        className="block w-full"
        draggable={false}
      />

      {/* ── Top strip: 3 spots above trackpad ── */}
      <div
        className="absolute flex"
        style={{
          top: '60.2%',
          height: '5.4%',
          left: '5%',
          right: '5%',
          gap,
        }}
      >
        {topSpots.map((spot, i) => (
          <div key={spot.id} className="flex-1">
            <SpotCell
              spot={spot}
              sizeLabel={INSIDE_SPOTS[i]?.sizeLabel || 'SMALL'}
              onSelect={onSelectSpot}
              cssVar="--basew"
            />
          </div>
        ))}
      </div>

      {/* ── Left of trackpad: 2 spots stacked ── */}
      <div
        className="absolute flex flex-col"
        style={{
          top: '66%',
          bottom: '8%',
          left: '5%',
          width: '26%',
          gap,
        }}
      >
        {leftSpots.map((spot, i) => (
          <div key={spot.id} className="flex-1">
            <SpotCell
              spot={spot}
              sizeLabel={INSIDE_SPOTS[3 + i]?.sizeLabel || 'SMALL'}
              onSelect={onSelectSpot}
              cssVar="--basew"
            />
          </div>
        ))}
      </div>

      {/* ── Right of trackpad: 2 spots stacked ── */}
      <div
        className="absolute flex flex-col"
        style={{
          top: '66%',
          bottom: '8%',
          right: '5%',
          width: '26%',
          gap,
        }}
      >
        {rightSpots.map((spot, i) => (
          <div key={spot.id} className="flex-1">
            <SpotCell
              spot={spot}
              sizeLabel={INSIDE_SPOTS[5 + i]?.sizeLabel || 'SMALL'}
              onSelect={onSelectSpot}
              cssVar="--basew"
            />
          </div>
        ))}
      </div>

      {/* ── Bottom strip: 3 spots below trackpad ── */}
      {bottomSpots.length > 0 && (
        <div
          className="absolute flex"
          style={{
            top: '92.3%',
            height: '4%',
            left: '5%',
            right: '5%',
            gap,
          }}
        >
          {bottomSpots.map((spot, i) => (
            <div key={spot.id} className="flex-1">
              <SpotCell
                spot={spot}
                sizeLabel={INSIDE_SPOTS[7 + i]?.sizeLabel || 'MEDIUM'}
                onSelect={onSelectSpot}
                cssVar="--basew"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── View toggle (exact brandmylaptop pill style) ──
function ViewToggle({
  view,
  onChange,
}: {
  view: 'lid' | 'inside';
  onChange: (v: 'lid' | 'inside') => void;
}) {
  const tabs: { key: 'lid' | 'inside'; label: string }[] = [
    { key: 'lid', label: 'Lid' },
    { key: 'inside', label: 'Inside' },
  ];

  return (
    <div className="flex justify-center mb-5">
      <div
        role="group"
        aria-label="View"
        className="flex rounded-full p-1 text-[13px] font-medium"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={view === tab.key}
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              view === tab.key
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.14)] ring-1 ring-black/10'
                : 'text-[#56565c] hover:text-[#1d1d1f]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main export ──
interface MacBookMockupProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function MacBookMockup({ spots, onSelectSpot }: MacBookMockupProps) {
  const [view, setView] = useState<'lid' | 'inside'>('lid');

  return (
    <div className="mx-auto w-full max-w-[860px] px-4">
      <ViewToggle view={view} onChange={setView} />

      {view === 'lid' ? (
        <LidView spots={spots} onSelectSpot={onSelectSpot} />
      ) : (
        <InsideView spots={spots} onSelectSpot={onSelectSpot} />
      )}
    </div>
  );
}
