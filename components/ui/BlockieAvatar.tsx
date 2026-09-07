'use client';

/**
 * BlockieAvatar
 *
 * Design system component — deterministic pixelated avatar from a seed string.
 *
 * NAME: BlockieAvatar
 *
 * WHEN TO USE:
 * - Spot table rows — avatar for brands/projects that paid with crypto
 * - Bid history entries — identify bidders by brand name
 * - Any list where you need a unique visual identifier per item without a real logo
 *
 * WHEN NOT TO USE:
 * - When the brand has an actual logo URL — show the real logo instead
 * - Available/empty spots — use a neutral circle with spot number
 *
 * PROPS:
 * - seed: string — generates a unique pattern (brand name, wallet address, etc.)
 * - size?: number — pixel dimensions (default: 36)
 */

import React, { useRef, useEffect } from 'react';

interface BlockieAvatarProps {
  seed: string;
  size?: number;
}

export function BlockieAvatar({ seed, size = 36 }: BlockieAvatarProps) {
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
      `hsl(${Math.abs(h) % 360}, 65%, 50%)`,
      `hsl(${(Math.abs(h) + 120) % 360}, 70%, 45%)`,
      `hsl(${(Math.abs(h) + 240) % 360}, 60%, 55%)`,
    ];

    const grid = 5;
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

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-full"
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
}
