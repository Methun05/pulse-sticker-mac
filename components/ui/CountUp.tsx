'use client';

import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { cn } from '@/lib/cn';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

export function CountUp({ value, duration = 2, prefix = '$', className }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || value === 0) return;
    hasAnimated.current = true;

    const start = performance.now();
    const durationMs = duration * 1000;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <TextMorph
      className={cn('tabular-nums', className)}
      style={{ display: 'inline-flex', justifyContent: 'center' }}
    >
      {prefix + display.toLocaleString()}
    </TextMorph>
  );
}
