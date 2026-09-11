'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

type Step = 'form' | 'securing' | 'failed-timeout' | 'failed-expired' | 'failed-outbid' | 'failed-rejected' | 'done' | 'done-reassigned';

const STEPS: { key: Step; label: string }[] = [
  { key: 'form', label: 'Form' },
  { key: 'securing', label: 'Securing Spot' },
  { key: 'failed-timeout', label: 'Failed: Timeout' },
  { key: 'failed-expired', label: 'Failed: Expired' },
  { key: 'failed-outbid', label: 'Failed: Outbid' },
  { key: 'failed-rejected', label: 'Failed: No Spots' },
  { key: 'done', label: 'Done' },
  { key: 'done-reassigned', label: 'Done (reassigned)' },
];

const fireConfetti = () => {
  const end = Date.now() + 3 * 1000;
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

export default function PreviewModals() {
  const [active, setActive] = useState<Step>('form');

  // Fire confetti when switching to done states
  useEffect(() => {
    if (active === 'done' || active === 'done-reassigned') {
      fireConfetti();
    }
  }, [active]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[28px] font-bold text-[var(--ink)] mb-2">BidModal UI States</h1>
        <p className="text-[14px] text-[var(--ink-3)] mb-8">Click a state to preview. Flow: Form → Payment provider (DePay/DoDo) → Done or Failed.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {STEPS.map(s => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                active === s.key
                  ? 'bg-[var(--ink)] text-white'
                  : 'bg-white border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--ink-3)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-[36px] shadow-dialog border border-[var(--hairline)] w-full max-w-lg overflow-hidden px-6 py-5">
            {/* Header */}
            <div className="flex items-center justify-between px-1 pb-2 min-h-[36px]">
              <div className="flex-1">
                {active === 'form' && <h3 className="text-[20px] font-bold text-[var(--ink)]">Place your bid</h3>}
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--hairline)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
              </button>
            </div>

            <div className="py-3 px-2">
              {/* Form */}
              {active === 'form' && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-[40px] font-bold text-[var(--ink)] tabular-nums">$10</div>
                  </div>
                  <div className="space-y-4">
                    <div className="border border-[var(--hairline)] rounded-2xl px-4 py-3 text-[var(--ink)]">Brand / Project name *</div>
                    <div className="border border-[var(--hairline)] rounded-2xl px-4 py-3 text-[var(--ink-3)]">Website</div>
                    <div className="border border-[var(--hairline)] rounded-2xl px-4 py-3 text-[var(--ink-3)]">Email (optional)</div>
                    <div className="border border-[var(--hairline)] rounded-2xl px-4 py-3 text-[var(--ink-3)]">X handle (optional)</div>
                    <div className="border-2 border-dashed border-[var(--hairline)] rounded-2xl px-4 py-8 text-center text-[var(--ink-3)] text-[13px]">Drop logo here or click to upload</div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button className="flex-1 rounded-full bg-[var(--accent)] text-white py-3 text-[15px] font-medium">Pay with Crypto</button>
                    <button className="flex-1 rounded-full border border-[var(--hairline)] text-[var(--ink)] py-3 text-[15px] font-medium">Pay with Fiat</button>
                  </div>
                  <p className="text-center text-[12px] text-[var(--ink-3)] mt-3">Other brands may hold this spot until they decide. <span className="underline">Terms</span>.</p>
                </div>
              )}

              {/* Securing */}
              {active === 'securing' && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
                    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="var(--hairline)" strokeWidth="2.5" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Securing your spot</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">Uploading your logo...</p>
                </div>
              )}

              {/* Failed: Timeout */}
              {active === 'failed-timeout' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Payment not confirmed yet</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">If you completed the payment, it may take a few minutes. You can wait or try again.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Try Again</button>
                </div>
              )}

              {/* Failed: Expired */}
              {active === 'failed-expired' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Bid expired</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">This bid has expired. Place a new bid to continue.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Try Again</button>
                </div>
              )}

              {/* Failed: Outbid */}
              {active === 'failed-outbid' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Spot taken</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">This spot was taken by another bidder. Try a different spot.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Close</button>
                </div>
              )}

              {/* Failed: Rejected */}
              {active === 'failed-rejected' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">No spots available</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">Your payment was received but all spots are currently taken. A refund will be processed.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Close</button>
                </div>
              )}

              {/* Done */}
              {active === 'done' && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  </div>
                  <h4 className="text-[20px] font-bold text-[var(--ink)]">You're in</h4>
                  <p className="text-[14px] text-[var(--ink-2)] mt-2">Spot #3 is yours. Your logo is now live on the board.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Done</button>
                </div>
              )}

              {/* Done (reassigned) */}
              {active === 'done-reassigned' && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  </div>
                  <h4 className="text-[20px] font-bold text-[var(--ink)]">You're in</h4>
                  <p className="text-[14px] text-[var(--ink-2)] mt-2">Spot #1 was taken, so you've been assigned <strong>Spot #5</strong>. Your logo is now live on the board.</p>
                  <button className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
