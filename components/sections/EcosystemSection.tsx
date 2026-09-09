'use client';

import React, { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  { name: 'PulseChain', logo: '/logos/pulsechain-icon.png' },
  { name: 'HEX', logo: '/logos/hex.svg' },
  { name: 'PRVX', logo: '/logos/pulsechain.webp' },
  { name: 'PulseX', logo: '/logos/pulsex-new.svg' },
  { name: 'INC', logo: '/logos/inc-new.svg' },
];

export function EcosystemSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="pb-8 sm:pb-10 px-4 sm:px-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <p className="text-center text-[13px] font-medium text-[var(--ink-3)] mb-6">
        Built for the PulseChain Ecosystem
      </p>

      <div className="flex items-center justify-center gap-8 sm:gap-12 max-w-2xl mx-auto">
        {PROJECTS.map((p) => (
          <img
            key={p.name}
            src={p.logo}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="h-7 w-auto object-contain max-w-[48px]"
          />
        ))}
      </div>
    </section>
  );
}
