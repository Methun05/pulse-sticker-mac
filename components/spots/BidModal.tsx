'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { LogoUpload } from '@/components/ui/LogoUpload';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { Stepper } from '@/components/ui/Stepper';
import { DodoPayments as DodoCheckout } from 'dodopayments-checkout';

declare global {
  interface Window {
    DePayWidgets: {
      Payment: (config: Record<string, unknown>) => void;
    };
  }
}

type Step = 'form' | 'securing' | 'failed' | 'done';
type FailReason = 'timeout' | 'expired' | 'outbid' | 'rejected';

interface BidModalProps {
  spot: SpotData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export function BidModal({ spot, isOpen, onClose, onConfirmed }: BidModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [email, setEmail] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bidAmount, setBidAmount] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bid state
  const [bidId, setBidId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<FailReason>('timeout');
  const [confirmedSpot, setConfirmedSpot] = useState<number | null>(null);
  const dodoInitialized = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestBidRef = useRef<{ bidId: string; uploadToken: string } | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

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

  // Upload logo + transition to done
  const finalize = async (finalBidId: string, finalUploadToken: string, spotNumber: number) => {
    setConfirmedSpot(spotNumber);
    onConfirmed();
    setStep('securing');

    // Upload logo in background
    if (logoFile) {
      try {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('bidId', finalBidId);
        formData.append('uploadToken', finalUploadToken);
        await fetch('/api/upload', { method: 'POST', body: formData });
      } catch {
        // Logo upload failed — not critical, admin can handle
      }
    }

    setStep('done');
    fireConfetti();
  };

  // Poll bid status after payment provider closes
  const startPolling = (pollBidId: string, pollUploadToken: string) => {
    stopPolling();
    let pollCount = 0;
    const maxPolls = 100; // 5 min at 3s intervals

    pollingRef.current = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        stopPolling();
        setFailReason('timeout');
        setStep('failed');
        return;
      }
      try {
        const res = await fetch(`/api/bid/status?bidId=${pollBidId}`);
        const data = await res.json();

        if (data.status === 'CONFIRMED') {
          stopPolling();
          await finalize(pollBidId, pollUploadToken, data.spotNumber);
        } else if (data.status === 'EXPIRED') {
          stopPolling();
          setFailReason('expired');
          setStep('failed');
        } else if (data.status === 'OUTBID') {
          stopPolling();
          setFailReason('outbid');
          setStep('failed');
        } else if (data.status === 'REJECTED') {
          stopPolling();
          setFailReason('rejected');
          setStep('failed');
        }
      } catch {
        // Network error — keep polling
      }
    }, 3000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen && spot) {
      stopPolling();
      setStep('form');
      setError('');
      setLogoFile(null);
      setBrandName('');
      setWebsite('');
      setXHandle('');
      setEmail('');
      setBidId(null);
      setUploadToken(null);
      setFailReason('timeout');
      setConfirmedSpot(null);
      const min = spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice;
      setBidAmount(min);
    }
  }, [isOpen, spot]);

  const minBid = spot ? (spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice) : 1;

  const handleSubmit = async (target: 'crypto' | 'card') => {
    if (!spot) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bid/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotNumber: spot.number,
          bidAmount,
          brandName,
          website: website || undefined,
          xHandle: xHandle || undefined,
          email: email || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create bid');
        return;
      }
      setBidId(data.bidId);
      setUploadToken(data.uploadToken);

      if (target === 'card') {
        // Store current bid info in ref so DoDo event handler always reads latest
        latestBidRef.current = { bidId: data.bidId, uploadToken: data.uploadToken };

        // Initialize DoDo overlay SDK once
        if (!dodoInitialized.current) {
          DodoCheckout.Initialize({
            mode: 'test',
            displayType: 'overlay',
            onEvent: async (event) => {
              if (event.event_type === 'checkout.closed') {
                const current = latestBidRef.current;
                if (!current) return;
                // Quick check if webhook already confirmed
                try {
                  const statusRes = await fetch(`/api/bid/status?bidId=${current.bidId}`);
                  const statusData = await statusRes.json();
                  if (statusData.status === 'CONFIRMED') {
                    await finalize(current.bidId, current.uploadToken, statusData.spotNumber);
                    return;
                  }
                } catch { /* ignore */ }
                // Not confirmed yet — start background polling, stay on form
                startPolling(current.bidId, current.uploadToken);
              }
            },
          });
          dodoInitialized.current = true;
        }

        // Create DoDo checkout session
        try {
          const checkoutRes = await fetch('/api/dodo/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidId: data.bidId }),
          });
          const checkoutData = await checkoutRes.json();
          if (!checkoutData.checkout_url) {
            setError(checkoutData.error || 'Failed to create checkout session');
            return;
          }
          DodoCheckout.Checkout.open({ checkoutUrl: checkoutData.checkout_url });
        } catch {
          setError('Failed to start fiat checkout. Please try again.');
        }
        return;
      }

      // Launch DePay widget
      if (!window.DePayWidgets) {
        setError('Payment widget not loaded yet. Please try again in a moment.');
        return;
      }

      const integration = process.env.NEXT_PUBLIC_DEPAY_INTEGRATION_ID;
      if (!integration) {
        setError('Payment integration not configured.');
        return;
      }

      window.DePayWidgets.Payment({
        integration,
        payload: { bidId: data.bidId },
        validated: () => {
          // DePay confirmed — start polling for webhook confirmation
          startPolling(data.bidId, data.uploadToken);
        },
        closed: () => {
          // User closed without completing — stay on form
        },
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !spot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[36px] shadow-dialog border border-[var(--hairline)] w-full sm:max-w-lg max-h-[85dvh] overflow-hidden animate-modal-in px-6 py-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-2 min-h-[36px]">
          <div className="flex-1">
            {step === 'form' && <h3 className="text-[20px] font-bold text-[var(--ink)]">Place your bid</h3>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--hairline)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto thin-scrollbar py-3 px-2">
          {/* Form */}
          {step === 'form' && (
            <form onSubmit={e => e.preventDefault()}>
              <div className="text-center mb-6">
                <div className="mt-1">
                  <Stepper
                    value={bidAmount}
                    min={minBid}
                    max={400}
                    onChange={setBidAmount}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FloatingInput
                  label="Brand / Project name *"
                  type="text"
                  required
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                />

                <FloatingInput
                  label="Website"
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />

                <FloatingInput
                  label="Email (optional)"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <FloatingInput
                  label="X handle (optional)"
                  type="text"
                  value={xHandle}
                  onChange={e => setXHandle(e.target.value)}
                />

                <LogoUpload value={logoFile} onChange={setLogoFile} />
              </div>

              {error && (
                <p className="text-[13px] text-[var(--red)] bg-red-50 rounded-lg px-3 py-2 mt-4">{error}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={loading || !brandName || !logoFile}
                  onClick={() => handleSubmit('crypto')}
                  className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white py-3 text-[15px] font-medium transition-colors"
                >
                  {loading ? 'Placing bid...' : 'Pay with Crypto'}
                </button>
                <button
                  type="button"
                  disabled={loading || !brandName || !logoFile}
                  onClick={() => handleSubmit('card')}
                  className="flex-1 rounded-full border border-[var(--hairline)] hover:border-[var(--ink-3)] disabled:opacity-50 text-[var(--ink)] py-3 text-[15px] font-medium transition-colors"
                >
                  {loading ? 'Placing bid...' : 'Pay with Fiat'}
                </button>
              </div>

              <p className="text-center text-[12px] text-[var(--ink-3)] mt-3">
                Other brands may hold this spot until they decide. <a href="/terms" className="underline">Terms</a>.
              </p>
            </form>
          )}

          {/* Securing — logo uploading after payment confirmed */}
          {step === 'securing' && (
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

          {/* Failed */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              {failReason === 'timeout' && (
                <>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Payment not confirmed yet</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">If you completed the payment, it may take a few minutes. You can wait or try again.</p>
                </>
              )}
              {failReason === 'expired' && (
                <>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Bid expired</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">This bid has expired. Place a new bid to continue.</p>
                </>
              )}
              {failReason === 'outbid' && (
                <>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">Spot taken</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">This spot was taken by another bidder. Try a different spot.</p>
                </>
              )}
              {failReason === 'rejected' && (
                <>
                  <h3 className="text-[20px] font-bold text-[var(--ink)]">No spots available</h3>
                  <p className="text-[14px] text-[var(--ink-3)] mt-2">Your payment was received but all spots are currently taken. A refund will be processed.</p>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  if (failReason === 'outbid' || failReason === 'rejected') {
                    onClose();
                  } else {
                    setBidId(null);
                    setUploadToken(null);
                    setStep('form');
                  }
                }}
                className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                {failReason === 'outbid' || failReason === 'rejected' ? 'Close' : 'Try Again'}
              </button>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <h4 className="text-[20px] font-bold text-[var(--ink)]">You're in</h4>
              {confirmedSpot && confirmedSpot !== spot.number ? (
                <p className="text-[14px] text-[var(--ink-2)] mt-2">
                  Spot #{spot.number} was taken, so you've been assigned <strong>Spot #{confirmedSpot}</strong>. Your logo is now live on the board.
                </p>
              ) : (
                <p className="text-[14px] text-[var(--ink-2)] mt-2">
                  Spot #{confirmedSpot || spot.number} is yours. Your logo is now live on the board.
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
