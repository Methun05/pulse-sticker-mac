import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PulseChainHeroBackgroundProps
  extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const PulseChainHeroBackground = forwardRef<
  HTMLDivElement,
  PulseChainHeroBackgroundProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative isolate overflow-hidden bg-[#0A0B0E]", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0d0f12_0%,#0A0B0E_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[28%] left-1/2 -z-10 h-[92%] w-[150%] -translate-x-1/2 rounded-[100%] [background:radial-gradient(ellipse_120%_88%_at_50%_100%,rgba(0,255,85,0.30)_0%,rgba(0,255,153,0.22)_25%,rgba(0,255,85,0.14)_50%,rgba(0,200,100,0.08)_70%,rgba(10,11,14,0)_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[22%] left-1/2 -z-10 h-[78%] w-[128%] -translate-x-1/2 rounded-[100%] blur-2xl [background:radial-gradient(ellipse_110%_80%_at_50%_100%,rgba(0,255,85,0.16)_0%,rgba(0,255,153,0.12)_30%,rgba(0,200,100,0.06)_60%,transparent_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[18%] left-1/2 -z-10 h-[58%] w-[104%] -translate-x-1/2 rounded-[100%] blur-3xl [background:radial-gradient(ellipse_100%_70%_at_50%_100%,rgba(255,255,255,0.06)_0%,transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:4px_4px]"
      />
      {children}
    </div>
  );
});

PulseChainHeroBackground.displayName = "PulseChainHeroBackground";
export { PulseChainHeroBackground };
