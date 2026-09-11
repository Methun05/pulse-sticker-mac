"use client";

/**
 * Displays "MM:SS remaining" in a subtle badge.
 * Turns red/urgent when under 5 minutes.
 * Returns null when seconds <= 0.
 */
export function CountdownBadge({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} remaining`;
  const urgent = seconds < 300;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium tabular-nums ${
        urgent
          ? "bg-red-50 text-[var(--red)]"
          : "text-[var(--ink-3)]"
      }`}
    >
      {label}
    </span>
  );
}
