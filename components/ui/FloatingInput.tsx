'use client';

import { cn } from "@/lib/cn";
import { useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, className, ...props }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <input
        className={cn(
          "peer w-full px-4 py-4 border rounded-xl bg-transparent outline-none text-sm text-[var(--ink)]",
          "border-[var(--hairline)] focus:border-[var(--ink)] transition-colors",
          className
        )}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(e.target.value !== "");
        }}
        onChange={(e) => setHasValue(e.target.value !== "")}
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 top-4 text-sm text-[var(--ink-3)] transition-all duration-200 pointer-events-none",
          "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1",
          "peer-focus:text-[var(--ink)]",
          (focused || hasValue) && "-top-2.5 left-3 text-xs bg-white px-1"
        )}
      >
        {label}
      </label>
    </div>
  );
}
