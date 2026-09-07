'use client';

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';

interface FoilButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function FoilButton({ children, onClick, className }: FoilButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const angle = Math.atan2(y - 50, x - 50) * (180 / Math.PI) + 90;

    btn.style.setProperty('--pointer-x', `${x}%`);
    btn.style.setProperty('--pointer-y', `${y}%`);
    btn.style.setProperty('--glare-x', `${x}%`);
    btn.style.setProperty('--glare-y', `${y}%`);
    btn.style.setProperty('--shine-angle', `${angle}deg`);
    btn.style.setProperty('--foil-shift', `${(x - 50) * 0.5}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.setProperty('--pointer-x', '50%');
    btn.style.setProperty('--pointer-y', '50%');
    btn.style.setProperty('--glare-x', '50%');
    btn.style.setProperty('--glare-y', '50%');
    btn.style.setProperty('--shine-angle', '135deg');
    btn.style.setProperty('--foil-shift', '0%');
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('depth-btn depth-foil', className)}
    >
      <span className="depth-foil-l depth-foil-base" />
      <span className="depth-foil-l depth-foil-film" />
      <span className="depth-foil-l depth-foil-pearl" />
      <span className="depth-label">{children}</span>
      <span className="depth-foil-l depth-foil-shine" />
      <span className="depth-foil-l depth-foil-glare" />
    </button>
  );
}
