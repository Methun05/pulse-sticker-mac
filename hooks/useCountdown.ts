"use client";

import { useState, useEffect } from "react";

/**
 * Returns seconds remaining from a given future timestamp.
 * Updates every second. Returns 0 when expired.
 */
export function useCountdown(expiresAt: string | null): number {
  const [seconds, setSeconds] = useState(() => calcRemaining(expiresAt));

  useEffect(() => {
    if (!expiresAt) {
      setSeconds(0);
      return;
    }

    setSeconds(calcRemaining(expiresAt));

    const id = setInterval(() => {
      const remaining = calcRemaining(expiresAt);
      setSeconds(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  return seconds;
}

function calcRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}
