'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/cn';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

const digitVariants = {
  initial: { y: 20, opacity: 0, scale: 0.5, filter: 'blur(2px)' },
  animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { y: -20, opacity: 0, scale: 0.5, filter: 'blur(2px)' },
};

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

  const digits = (prefix + display.toLocaleString()).split('');
  const [prevDigits, setPrevDigits] = useState<string[]>([]);
  const [ticks, setTicks] = useState<number[]>([]);

  const len = digits.length;
  const lenDiff = len - prevDigits.length;

  const nextTicks = digits.map((digit, i) => {
    const prevI = i - lenDiff;
    const prevDigit = prevI >= 0 ? prevDigits[prevI] : undefined;
    const prevTick = prevI >= 0 ? ticks[prevI] : 0;
    return digit !== prevDigit ? (prevTick ?? 0) + 1 : (prevTick ?? 0);
  });

  if (prevDigits.join('') !== digits.join('')) {
    setTicks(nextTicks);
    setPrevDigits(digits);
  }

  return (
    <div className={cn('tabular-nums', className)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {digits.map((digit, index) => (
        <div
          key={`${index}-${len}`}
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: digit === ',' ? '0.3em' : '0.6em', height: '1.1em' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={nextTicks[index]}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 200, damping: 16, mass: 1.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
