'use client';

import React, { useState, useEffect } from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { LogoUpload } from '@/components/ui/LogoUpload';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { Stepper } from '@/components/ui/Stepper';

declare global {
  interface Window {
    DePayWidgets: {
      Payment: (config: Record<string, unknown>) => void;
    };
  }
}

type Step = 'form' | 'card' | 'logo' | 'done' | 'expired';

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

  // Bid state (set after form submit)
  const [bidId, setBidId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen && spot) {
      setStep('form');
      setError('');
      setLogoFile(null);
      setXHandle('');
      setEmail('');
      setBidId(null);
      setUploadToken(null);
      const min = spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice;
      setBidAmount(min);
    }
  }, [isOpen, spot]);

  const minBid = spot ? (spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice) : 1;

  // Form submit → create bid → launch DePay widget
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
        setStep('card');
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
          setBidId(data.bidId);
          setUploadToken(data.uploadToken);
          setStep('logo');
          onConfirmed();
        },
        closed: () => {
          // User closed widget without completing — stay on form so they can retry
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
        <div className="relative flex items-center justify-center px-1 pb-2">
          {step === 'form' && <h3 className="text-[20px] font-bold text-[var(--ink)]">Place your bid</h3>}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-1 z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--hairline)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto thin-scrollbar py-3 px-2">
          {/* Step 1: Form */}
          {step === 'form' && (
            <form onSubmit={e => e.preventDefault()}>
              <div className="text-center mb-6">
                <div className="mt-1">
                  <Stepper
                    value={bidAmount}
                    min={minBid}
                    max={10000}
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

          {/* Card (coming soon) */}
          {step === 'card' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="text-[20px] font-bold text-[var(--ink)]">Card payments coming soon</h3>
              <p className="text-[14px] text-[var(--ink-3)] mt-2">We're working on adding card payments. For now, you can pay with crypto.</p>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="mt-6 rounded-full border border-[var(--hairline)] px-6 py-2.5 text-[14px] font-medium hover:border-[var(--ink-3)] transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Logo upload after payment */}
          {step === 'logo' && bidId && uploadToken && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-[20px] font-bold text-[var(--ink)]">Payment confirmed</h4>
                <p className="text-[14px] text-[var(--ink-2)] mt-2">Upload your logo to display it on the board.</p>
              </div>
              <LogoUpload
                bidId={bidId}
                uploadToken={uploadToken}
                onSubmitted={() => setStep('done')}
                initialFile={logoFile || undefined}
              />
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <h4 className="text-[20px] font-bold text-[var(--ink)]">Logo submitted</h4>
              <p className="text-[14px] text-[var(--ink-2)] mt-2">
                Spot #{spot.number} is yours. Your logo is now live on the board.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[var(--accent)] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Expired */}
          {step === 'expired' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h4 className="text-[20px] font-bold text-[var(--ink)]">Payment expired</h4>
              <p className="text-[14px] text-[var(--ink-2)] mt-2">
                The 30-minute window has passed. Please try again.
              </p>
              <button
                onClick={() => setStep('form')}
                className="mt-6 rounded-full border border-[var(--hairline)] px-6 py-2.5 text-[14px] font-medium hover:border-[var(--ink-3)] transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
