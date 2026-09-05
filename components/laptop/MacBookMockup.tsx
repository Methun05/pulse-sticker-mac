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
const LID_STOPS = ['#ececed', '#dcdcdf', '#c8c8cd'];

// Apple logo SVG (exact path + viewBox from brandmylaptop source)
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

// ── Shared spot cell renderer ──
function SpotCell({
  spot,
  layout,
  onSelectSpot,
  lidVar,
}: {
  spot: SpotData;
  layout: { sizeLabel: string };
  onSelectSpot: (s: SpotData) => void;
  lidVar: string;
}) {
  const isOccupied = spot.currentBid > 0 && spot.brandName;

  if (isOccupied) {
    return (
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
            style={{ fontSize: `calc(var(${lidVar}, 100cqw) * 0.016)` }}
          >
            {spot.brandName}
          </span>
        )}
        <span
          className="font-medium text-[#1a7f37]"
          style={{ fontSize: `calc(var(${lidVar}, 100cqw) * 0.013)` }}
        >
          ${spot.currentBid}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelectSpot(spot)}
      className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-[calc(var(--lidw,100cqw)*0.014)] border border-dashed border-black/15 transition-all hover:border-black/30 hover:bg-white/10"
    >
      <span
        className="font-medium uppercase tracking-wide text-[#1d1d1f]/50"
        style={{ fontSize: `calc(var(${lidVar}, 100cqw) * 0.013)` }}
      >
        {layout.sizeLabel}
      </span>
      <span
        className="font-semibold tabular-nums text-[#1d1d1f]"
        style={{ fontSize: `calc(var(${lidVar}, 100cqw) * 0.016)` }}
      >
        ${spot.startingPrice}
      </span>
    </button>
  );
}

// ── Keyboard layout: each row is an array of { label, flex } ──
const KB_ROWS: { label: string; flex: number }[][] = [
  // Function row (half-height)
  [
    { label: 'esc', flex: 1 }, { label: 'F1', flex: 1 }, { label: 'F2', flex: 1 },
    { label: 'F3', flex: 1 }, { label: 'F4', flex: 1 }, { label: 'F5', flex: 1 },
    { label: 'F6', flex: 1 }, { label: 'F7', flex: 1 }, { label: 'F8', flex: 1 },
    { label: 'F9', flex: 1 }, { label: 'F10', flex: 1 }, { label: 'F11', flex: 1 },
    { label: 'F12', flex: 1 }, { label: '🔒', flex: 1 },
  ],
  // Number row
  [
    { label: '`', flex: 1 }, { label: '1', flex: 1 }, { label: '2', flex: 1 },
    { label: '3', flex: 1 }, { label: '4', flex: 1 }, { label: '5', flex: 1 },
    { label: '6', flex: 1 }, { label: '7', flex: 1 }, { label: '8', flex: 1 },
    { label: '9', flex: 1 }, { label: '0', flex: 1 }, { label: '-', flex: 1 },
    { label: '=', flex: 1 }, { label: '⌫', flex: 1.5 },
  ],
  // QWERTY row
  [
    { label: '⇥', flex: 1.5 }, { label: 'Q', flex: 1 }, { label: 'W', flex: 1 },
    { label: 'E', flex: 1 }, { label: 'R', flex: 1 }, { label: 'T', flex: 1 },
    { label: 'Y', flex: 1 }, { label: 'U', flex: 1 }, { label: 'I', flex: 1 },
    { label: 'O', flex: 1 }, { label: 'P', flex: 1 }, { label: '[', flex: 1 },
    { label: ']', flex: 1 }, { label: '\\', flex: 1 },
  ],
  // Home row
  [
    { label: '⇪', flex: 1.75 }, { label: 'A', flex: 1 }, { label: 'S', flex: 1 },
    { label: 'D', flex: 1 }, { label: 'F', flex: 1 }, { label: 'G', flex: 1 },
    { label: 'H', flex: 1 }, { label: 'J', flex: 1 }, { label: 'K', flex: 1 },
    { label: 'L', flex: 1 }, { label: ';', flex: 1 }, { label: "'", flex: 1 },
    { label: '⏎', flex: 1.75 },
  ],
  // Shift row
  [
    { label: '⇧', flex: 2.25 }, { label: 'Z', flex: 1 }, { label: 'X', flex: 1 },
    { label: 'C', flex: 1 }, { label: 'V', flex: 1 }, { label: 'B', flex: 1 },
    { label: 'N', flex: 1 }, { label: 'M', flex: 1 }, { label: ',', flex: 1 },
    { label: '.', flex: 1 }, { label: '/', flex: 1 }, { label: '⇧', flex: 2.25 },
  ],
  // Bottom row
  [
    { label: 'fn', flex: 1 }, { label: '⌃', flex: 1 }, { label: '⌥', flex: 1 },
    { label: '⌘', flex: 1.25 }, { label: '', flex: 5 }, { label: '⌘', flex: 1.25 },
    { label: '⌥', flex: 1 }, { label: '←', flex: 1 }, { label: '↑↓', flex: 1 },
    { label: '→', flex: 1 },
  ],
];

// ── Inside palm rest spot layout: 3-col × 2-row ──
const INSIDE_SPOTS: { row: number; col: number; sizeLabel: string }[] = [
  { row: 1, col: 1, sizeLabel: 'LARGE' },
  { row: 1, col: 2, sizeLabel: 'LARGE' },
  { row: 1, col: 3, sizeLabel: 'LARGE' },
  { row: 2, col: 1, sizeLabel: 'SMALL' },
  { row: 2, col: 2, sizeLabel: 'SMALL' },
  { row: 2, col: 3, sizeLabel: 'SMALL' },
];

// ── Inside view: MacBook open from top ──
function InsideView({
  spots,
  onSelectSpot,
}: {
  spots: SpotData[];
  onSelectSpot: (s: SpotData) => void;
}) {
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;
    const sync = () =>
      el.style.setProperty('--basew', `${el.getBoundingClientRect().width}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={baseRef} className="mx-auto w-full max-w-[860px]" style={{ containerType: 'inline-size' }}>
      {/* ── Screen edge (thin hinge bar at top) ── */}
      <div
        className="mx-auto"
        style={{
          width: '94%',
          height: '8px',
          borderRadius: '4px 4px 0 0',
          background: 'linear-gradient(180deg, #c5c5ca 0%, #b0b0b5 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      />

      {/* ── Base body ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1.3',
          borderRadius: '0 0 calc(var(--basew, 100cqw) * 0.026) calc(var(--basew, 100cqw) * 0.026)',
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

        <div
          className="relative z-10 flex h-full flex-col"
          style={{ padding: 'calc(var(--basew, 100cqw) * 0.03)' }}
        >
          {/* ── Keyboard ── */}
          <div
            className="flex w-full flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)',
              borderRadius: 'calc(var(--basew, 100cqw) * 0.014)',
              padding: 'calc(var(--basew, 100cqw) * 0.01)',
              gap: 'calc(var(--basew, 100cqw) * 0.004)',
              flex: '0 0 60%',
            }}
          >
            {KB_ROWS.map((row, ri) => (
              <div
                key={ri}
                className="flex"
                style={{
                  flex: ri === 0 ? '0 0 12%' : 1,
                  gap: 'calc(var(--basew, 100cqw) * 0.004)',
                }}
              >
                {row.map((key, ki) => (
                  <div
                    key={ki}
                    className="flex items-center justify-center select-none"
                    style={{
                      flex: key.flex,
                      borderRadius: 'calc(var(--basew, 100cqw) * 0.006)',
                      background: key.label === ''
                        ? 'linear-gradient(180deg, #3a3a3c 0%, #303032 100%)'
                        : 'linear-gradient(180deg, #4a4a4e 0%, #3a3a3e 100%)',
                      fontSize: ri === 0
                        ? 'calc(var(--basew, 100cqw) * 0.01)'
                        : 'calc(var(--basew, 100cqw) * 0.015)',
                      color: 'rgba(255,255,255,0.55)',
                      boxShadow: '0 1px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    {key.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── Palm rest with spots (3×2 grid, no trackpad) ── */}
          <div
            className="flex-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
              gap: 'calc(var(--basew, 100cqw) * 0.012)',
              marginTop: 'calc(var(--basew, 100cqw) * 0.02)',
            }}
          >
            {spots.slice(0, 6).map((spot, i) => {
              const layout = INSIDE_SPOTS[i];
              if (!layout) return null;

              return (
                <div
                  key={spot.id}
                  style={{
                    gridColumn: layout.col,
                    gridRow: layout.row,
                  }}
                >
                  <SpotCell
                    spot={spot}
                    layout={{ sizeLabel: layout.sizeLabel }}
                    onSelectSpot={onSelectSpot}
                    lidVar="--basew"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View toggle (exact brandmylaptop style) ──
function ViewToggle({
  view,
  onViewChange,
}: {
  view: 'lid' | 'inside';
  onViewChange: (v: 'lid' | 'inside') => void;
}) {
  return (
    <div className="flex justify-center mb-5">
      <div
        role="group"
        aria-label="View"
        className="flex rounded-full p-1 text-[13px] font-medium"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        {([
          { key: 'lid' as const, label: 'Lid' },
          { key: 'inside' as const, label: 'Inside' },
        ]).map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={view === item.key}
            onClick={() => onViewChange(item.key)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              view === item.key
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.14)] ring-1 ring-black/10'
                : 'text-[#56565c] hover:text-[#1d1d1f]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MacBookMockupProps {
  spots: SpotData[];
  onSelectSpot: (spot: SpotData) => void;
}

export function MacBookMockup({ spots, onSelectSpot }: MacBookMockupProps) {
  const [view, setView] = useState<'lid' | 'inside'>('lid');
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
    <div className="mx-auto w-full max-w-[860px] px-4">
      <ViewToggle view={view} onViewChange={setView} />

      {view === 'lid' ? (
        <div style={{ containerType: 'inline-size' }}>
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
            {/* ── Specular highlight overlay ── */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: 'inherit',
                background:
                  'radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 42%, transparent 70%)',
              }}
            />

            {/* ── Apple logo ── */}
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
                      layout={layout}
                      onSelectSpot={onSelectSpot}
                      lidVar="--lidw"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <InsideView spots={spots} onSelectSpot={onSelectSpot} />
      )}
    </div>
  );
}
