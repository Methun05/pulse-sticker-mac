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

// ── Keyboard rows (AZERTY layout from brandmylaptop screenshot) ──
const KB_ROWS = [
  { keys: ['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','⏏'], small: true },
  { keys: ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'], small: false },
  { keys: ['⇥','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'], small: false },
  { keys: ['⇪','A','S','D','F','G','H','J','K','L',';','\'','⏎'], small: false },
  { keys: ['⇧','Z','X','C','V','B','N','M',',','.','/','⇧'], small: false },
  { keys: ['fn','⌃','⌥','⌘','','⌘','⌥','←','↑↓','→'], small: false },
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
      {/* ── Screen edge (thin bar at top) ── */}
      <div
        className="mx-auto rounded-t-[8px]"
        style={{
          width: '92%',
          height: '10px',
          background: 'linear-gradient(180deg, #b8b8bd 0%, #a8a8ad 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      />

      {/* ── Base body ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1.52',
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

        <div className="relative z-10 flex h-full flex-col" style={{ padding: 'calc(var(--basew, 100cqw) * 0.025)' }}>
          {/* ── Keyboard ── */}
          <div
            className="mx-auto flex w-full flex-col overflow-hidden rounded-[6px]"
            style={{
              background: 'linear-gradient(180deg, #2a2a2c 0%, #1b1b1d 100%)',
              padding: 'calc(var(--basew, 100cqw) * 0.008)',
              gap: 'calc(var(--basew, 100cqw) * 0.004)',
              flex: '0 0 58%',
            }}
          >
            {KB_ROWS.map((row, ri) => (
              <div key={ri} className="flex flex-1 gap-[1px]">
                {row.keys.map((key, ki) => {
                  const isSpace = key === '';
                  return (
                    <div
                      key={ki}
                      className={`flex items-center justify-center rounded-[3px] text-white/70 select-none ${
                        isSpace ? 'flex-[4]' : 'flex-1'
                      }`}
                      style={{
                        background: isSpace
                          ? 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)'
                          : 'linear-gradient(180deg, #4a4a4c 0%, #3a3a3c 100%)',
                        fontSize: row.small
                          ? 'calc(var(--basew, 100cqw) * 0.008)'
                          : 'calc(var(--basew, 100cqw) * 0.012)',
                        minHeight: row.small ? '40%' : undefined,
                      }}
                    >
                      <span className="opacity-60">{key}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Palm rest / Trackpad area with spots ── */}
          <div
            className="relative mt-auto flex-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
              gap: 'calc(var(--basew, 100cqw) * 0.012)',
              paddingTop: 'calc(var(--basew, 100cqw) * 0.015)',
            }}
          >
            {/* Trackpad (center of the grid, overlaid) */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 rounded-[8px]"
              style={{
                width: '38%',
                height: '80%',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />

            {/* Palm rest spots — positions around the trackpad */}
            {spots.map((spot) => {
              const layout = SPOT_LAYOUT[spot.number];
              if (!layout) return null;
              // Map lid spots to inside positions:
              // Row 1 (top 3 large) → not shown on inside
              // Row 2 (small spots) → left & right of trackpad
              // Row 3 (medium) → bottom row
              // For inside, we show spots 4-10 (the small + medium ones)
              // arranged as 2 rows of 3 around the trackpad
              return null; // We'll use a dedicated inside layout below
            })}

            {/* Inside spots: 2 rows × 3 cols around trackpad */}
            {spots.slice(0, 6).map((spot, i) => {
              // 6 spots on the palm rest: 3 top row, 3 bottom row
              const row = i < 3 ? 1 : 2;
              const col = (i % 3) * 2 + 1;
              const colSpan = 2;

              return (
                <div
                  key={spot.id}
                  className="relative z-10"
                  style={{
                    gridColumn: `${col} / span ${colSpan}`,
                    gridRow: row,
                  }}
                >
                  <SpotCell
                    spot={spot}
                    layout={SPOT_LAYOUT[spot.number] || { sizeLabel: 'SMALL' }}
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
