'use client';

import React, { useEffect, useRef } from 'react';

const BRANDS = ['PulseX', 'HEX', 'Liquid Loans', 'PCOCK', 'SOIL', 'RichardSwap', 'Mintra'];

// Crypto-native color palette — warm tones with accent variety
// Each triplet is [hue, hue, hue] designed to contrast well together
const COLOR_PALETTES = [
  [350, 35, 275],    // coral + amber + violet
  [20, 290, 45],     // orange + purple + gold
  [330, 50, 265],    // magenta + warm yellow + deep purple
  [10, 310, 40],     // red + pink + amber
  [345, 270, 25],    // rose + indigo + orange
  [15, 285, 340],    // tangerine + violet + crimson
  [40, 320, 0],      // gold + hot pink + red
  [300, 30, 355],    // purple + amber + rose
  [25, 260, 335],    // orange + deep violet + magenta
  [5, 45, 290],      // red-orange + gold + purple
  [315, 15, 270],    // fuchsia + coral + violet
  [35, 350, 280],    // amber + crimson + purple
];

function getPalette(h: number): [number, number, number] {
  return COLOR_PALETTES[Math.abs(h) % COLOR_PALETTES.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function seedColors(seed: string, count: number): string[] {
  const h = hashCode(seed);
  return Array.from({ length: count }, (_, i) => {
    const hue = (h + i * 137) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  });
}

// Blockies — canvas-based, no external lib
function BlockieCanvas({ seed, size = 40 }: { seed: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = seed.toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    const colors = [
      `hsl(${getPalette(h)[0]}, 70%, 52%)`,
      `hsl(${getPalette(h)[1]}, 65%, 48%)`,
      `hsl(${getPalette(h)[2]}, 60%, 55%)`,
    ];
    const grid = 8;
    const cellSize = size / grid;
    let rng = Math.abs(h);
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < Math.ceil(grid / 2); x++) {
        rng = (rng * 16807 + 0) % 2147483647;
        const colorIdx = rng % 3;
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.fillRect((grid - 1 - x) * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [seed, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded-full" style={{ width: size, height: size, imageRendering: 'pixelated' }} />;
}

// Marble
function Marble({ seed, size = 40 }: { seed: string; size?: number }) {
  const h = hashCode(seed);
  const c1 = `hsl(${h % 360}, 70%, 60%)`;
  const c2 = `hsl(${(h + 120) % 360}, 60%, 50%)`;
  const c3 = `hsl(${(h + 240) % 360}, 65%, 55%)`;
  const id = `m-${h}`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <rect width="80" height="80" fill={c1} />
      <circle cx={25 + (h % 30)} cy={25 + ((h >> 4) % 30)} r="25" fill={c2} opacity="0.7" />
      <circle cx={55 - (h % 20)} cy={55 - ((h >> 6) % 20)} r="18" fill={c3} opacity="0.6" />
    </svg>
  );
}

// Beam (smiley)
function Beam({ seed, size = 40 }: { seed: string; size?: number }) {
  const h = hashCode(seed);
  const bg = `hsl(${h % 360}, 70%, 65%)`;
  const face = `hsl(${(h + 60) % 360}, 50%, 35%)`;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <rect width="36" height="36" fill={bg} />
      <circle cx="12" cy="14" r="2" fill={face} />
      <circle cx="24" cy="14" r="2" fill={face} />
      <path d={`M 12 22 Q 18 ${26 + (h % 2)} 24 22`} fill="none" stroke={face} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Rings
function Rings({ seed, size = 40 }: { seed: string; size?: number }) {
  const colors = seedColors(seed, 4);
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <circle cx="40" cy="40" r="40" fill={colors[0]} />
      <circle cx="40" cy="40" r="30" fill={colors[1]} />
      <circle cx="40" cy="40" r="20" fill={colors[2]} />
      <circle cx="40" cy="40" r="10" fill={colors[3]} />
    </svg>
  );
}

// Bauhaus
function Bauhaus({ seed, size = 40 }: { seed: string; size?: number }) {
  const h = hashCode(seed);
  const colors = seedColors(seed, 4);
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <rect width="80" height="80" fill={colors[0]} />
      <circle cx={h % 60 + 10} cy={(h >> 4) % 60 + 10} r="22" fill={colors[1]} />
      <rect x={(h >> 8) % 40} y={(h >> 12) % 40} width="30" height="30" fill={colors[2]} opacity="0.8" />
      <circle cx={60 - (h % 20)} cy={60 - ((h >> 6) % 20)} r="14" fill={colors[3]} />
    </svg>
  );
}

// Sunset
function Sunset({ seed, size = 40 }: { seed: string; size?: number }) {
  const colors = seedColors(seed, 5);
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      {colors.map((c, i) => (
        <rect key={i} x="0" y={i * 16} width="80" height="16" fill={c} />
      ))}
    </svg>
  );
}

// Initial
function Initial({ seed, size = 40 }: { seed: string; size?: number }) {
  const h = hashCode(seed);
  const bg = `hsl(${h % 360}, 55%, 50%)`;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.4 }}>
      {seed.charAt(0).toUpperCase()}
    </div>
  );
}

// Blockie with configurable grid size
function BlockieGrid({ seed, size = 40, grid = 8 }: { seed: string; size?: number; grid?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = seed.toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    const colors = [
      `hsl(${getPalette(h)[0]}, 70%, 52%)`,
      `hsl(${getPalette(h)[1]}, 65%, 48%)`,
      `hsl(${getPalette(h)[2]}, 60%, 55%)`,
    ];
    const cellSize = size / grid;
    let rng = Math.abs(h);
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < Math.ceil(grid / 2); x++) {
        rng = (rng * 16807 + 0) % 2147483647;
        const colorIdx = rng % 3;
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.fillRect((grid - 1 - x) * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [seed, size, grid]);
  return <canvas ref={ref} width={size} height={size} className="rounded-full" style={{ width: size, height: size, imageRendering: 'pixelated' }} />;
}

const STYLES: { name: string; desc: string; Comp: React.FC<{ seed: string; size?: number }> }[] = [
  { name: 'Blockies 4x4', desc: 'Fewer blocks — chunky, bold', Comp: (p) => <BlockieGrid {...p} grid={4} /> },
  { name: 'Blockies 5x5', desc: 'Medium blocks — balanced', Comp: (p) => <BlockieGrid {...p} grid={5} /> },
  { name: 'Blockies 6x6', desc: 'Slightly fewer than default', Comp: (p) => <BlockieGrid {...p} grid={6} /> },
  { name: 'Blockies 8x8 (current)', desc: 'Current — standard Ethereum blockie', Comp: BlockieCanvas },
];

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1d1d1f' }}>Blockie Grid Size Comparison</h1>
      <p className="text-sm mb-10" style={{ color: '#86868b' }}>4x4 = chunky, 5x5 = balanced, 6x6 = detailed, 8x8 = current</p>

      {STYLES.map(({ name, desc, Comp }) => (
        <section key={name} className="mb-12">
          <h2 className="text-lg font-semibold mb-0.5" style={{ color: '#1d1d1f' }}>{name}</h2>
          <p className="text-sm mb-4" style={{ color: '#86868b' }}>{desc}</p>

          <div className="flex gap-5 mb-5">
            {BRANDS.map(b => (
              <div key={b} className="flex flex-col items-center gap-1.5">
                <Comp seed={b} size={40} />
                <span className="text-[11px]" style={{ color: '#86868b' }}>{b}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-2" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 2px 0 rgba(0,0,0,0.01), 0 4px 4px 0 rgba(0,0,0,0.01), 0 2px 24px 0 rgba(0,0,0,0.04)' }}>
            {BRANDS.slice(0, 3).map(brand => (
              <div key={brand} className="flex w-full items-center gap-3 rounded-xl p-2 py-2.5 hover:bg-[#f5f5f7] transition-colors duration-300">
                <div className="shrink-0"><Comp seed={brand} size={36} /></div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-semibold text-[15px]" style={{ color: '#1d1d1f' }}>{brand}</p>
                  <p className="truncate text-[13px]" style={{ color: '#86868b' }}>Center Lid · 3 outbids</p>
                </div>
                <div className="shrink-0 text-right mr-1">
                  <p className="text-[15px] font-semibold" style={{ color: '#1d1d1f' }}>$50</p>
                </div>
                <button className="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium border" style={{ borderColor: '#0071e3', color: '#0071e3' }}>Outbid</button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
