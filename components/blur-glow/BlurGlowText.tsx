'use client';

import { useEffect, useRef } from 'react';
import { BlurGlow } from './engine';

interface BlurGlowTextProps {
  className?: string;
}

export function BlurGlowText({ className }: BlurGlowTextProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BlurGlow | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const engine = new BlurGlow(host);
    engineRef.current = engine;
    engine.mount();

    if (prefersReduced) {
      engine.renderStill();
    } else {
      engine.start();
    }

    const onResize = () => engineRef.current?.onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: '100%', aspectRatio: '3 / 1' }}
    />
  );
}
