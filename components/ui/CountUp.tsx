'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

export function CountUp({ value, duration = 2, prefix = '$', className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current || value === 0) return;

    let cancelled = false;
    hasAnimated.current = true;

    async function animate() {
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default || gsapModule;
      if (cancelled || !ref.current) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = prefix + Math.round(obj.val).toLocaleString();
          }
        },
      });
    }

    animate();
    return () => { cancelled = true; };
  }, [value, duration, prefix]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
    >
      {prefix}{value.toLocaleString()}
    </span>
  );
}
