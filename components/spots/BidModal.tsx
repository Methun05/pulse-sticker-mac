'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { LogoUpload } from '@/components/ui/LogoUpload';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { Stepper } from '@/components/ui/Stepper';

type Step = 'form' | 'crypto' | 'card' | 'pay' | 'logo' | 'done' | 'expired';

interface BidModalProps {
  spot: SpotData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

const CHAIN_OPTIONS = [
  { id: 1, name: 'Ethereum' },
  { id: 56, name: 'BSC' },
  { id: 369, name: 'PulseChain' },
  { id: 8453, name: 'Base' },
  { id: 137, name: 'Polygon' },
];

const TOKEN_OPTIONS = ['USDC', 'USDT', 'DAI'];

export function BidModal({ spot, isOpen, onClose, onConfirmed }: BidModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bid state (set after form submit)
  const [bidId, setBidId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);

  // Crypto payment fields
  const [token, setToken] = useState('USDC');
  const [chainId, setChainId] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');

  // Payment state
  const [paymentData, setPaymentData] = useState<{
    bidId: string;
    paymentId: string;
    depositAddress: string;
    tokenAmount: string;
    tokenAmountDisplay: number;
    tokenName: string;
    expiresAt: string;
    chainName: string;
    uploadToken: string;
  } | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen && spot) {
      setStep('form');
      setError('');
      setPaymentData(null);
      setLogoUrl(null);
      setXHandle('');
      setEmail('');
      setBidId(null);
      setUploadToken(null);
      setToken('USDC');
      setChainId(1);
      setWalletAddress('');
      const min = spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice;
      setBidAmount(min);
    }
  }, [isOpen, spot]);

  const minBid = spot ? (spot.currentBid > 0 ? spot.currentBid + 5 : spot.startingPrice) : 1;

  // Form submit → create bid → go to selected payment step
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
          logoUrl: logoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create bid');
        return;
      }
      setBidId(data.bidId);
      setUploadToken(data.uploadToken);
      setStep(target);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Crypto submit → initiate payment → go to pay step
  const handleCryptoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidId) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, walletAddress, token, chainId }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to initiate payment');
        return;
      }
      setPaymentData({ ...data, tokenName: data.token, uploadToken: uploadToken! });
      setStep('pay');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment confirmation
  const pollStatus = useCallback(async () => {
    if (!paymentData) return;
    try {
      const res = await fetch(`/api/payment/status?bidId=${paymentData.bidId}`);
      const data = await res.json();
      if (data.confirmed) {
        setStep('logo');
        onConfirmed();
      } else if (data.status === 'EXPIRED') {
        setStep('expired');
      }
    } catch {
      // retry next interval
    }
  }, [paymentData, onConfirmed]);

  useEffect(() => {
    if (step !== 'pay') return;
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [step, pollStatus]);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!paymentData?.expiresAt) return;
    const tick = () => {
      const diff = new Date(paymentData.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        setStep('expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [paymentData?.expiresAt]);

  if (!isOpen || !spot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[36px] shadow-dialog border border-[var(--hairline)] w-full sm:max-w-lg max-h-[95dvh] overflow-hidden animate-modal-in px-4 py-4 flex flex-col">
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
        <div className="flex-1 overflow-y-auto thin-scrollbar py-3 px-1">
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

                <LogoUpload value={logoUrl} onChange={setLogoUrl} />
              </div>

              {error && (
                <p className="text-[13px] text-[var(--red)] bg-red-50 rounded-lg px-3 py-2 mt-4">{error}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit('crypto')}
                  className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white py-3 text-[15px] font-medium transition-colors"
                >
                  {loading ? 'Placing bid...' : 'Pay with Crypto'}
                </button>
                <button
                  type="button"
                  disabled={loading}
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

          {/* Crypto details */}
          {step === 'crypto' && (
            <form onSubmit={handleCryptoSubmit}>
              <div className="text-center mb-6">
                <h3 className="text-[20px] font-bold text-[var(--ink)]">Crypto payment</h3>
                <p className="text-[13px] text-[var(--ink-3)] mt-1">Select token, chain, and enter your wallet</p>
              </div>

              <div className="space-y-4">
                {/* Token select */}
                <div>
                  <label className="block text-[12px] text-[var(--ink-3)] uppercase tracking-[0.08em] mb-1.5">Token</label>
                  <div className="flex gap-2">
                    {TOKEN_OPTIONS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setToken(t)}
                        className={`flex-1 rounded-xl border py-2.5 text-[14px] font-medium transition-colors ${
                          token === t
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                            : 'border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink-3)]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chain select */}
                <div>
                  <label className="block text-[12px] text-[var(--ink-3)] uppercase tracking-[0.08em] mb-1.5">Chain</label>
                  <div className="flex flex-wrap gap-2">
                    {CHAIN_OPTIONS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChainId(c.id)}
                        className={`rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors ${
                          chainId === c.id
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                            : 'border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink-3)]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet address */}
                <FloatingInput
                  label="Wallet address *"
                  type="text"
                  required
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-[13px] text-[var(--red)] bg-red-50 rounded-lg px-3 py-2 mt-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white py-3 text-[15px] font-medium transition-colors mt-5"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>

              <button
                type="button"
                onClick={() => { setError(''); setStep('form'); }}
                className="w-full text-center text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] mt-3 transition-colors"
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3b: Card (coming soon) */}
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

          {/* Step 4: Payment instructions */}
          {step === 'pay' && paymentData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                </div>
                <h4 className="text-[17px] font-semibold text-[var(--ink)]">Send payment</h4>
                <p className="text-[13px] text-[var(--ink-3)] mt-1">Time remaining: <span className="font-mono font-medium text-[var(--ink)]">{timeLeft}</span></p>
              </div>

              {/* Amount */}
              <div className="bg-[var(--surface)] rounded-xl p-4 text-center">
                <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em] mb-1">Send exactly</div>
                <div className="text-[28px] font-bold tracking-[-0.02em] text-[var(--ink)]">
                  {paymentData.tokenAmountDisplay} {paymentData.tokenName}
                </div>
                <div className="text-[13px] text-[var(--ink-3)]">on {paymentData.chainName}</div>
              </div>

              {/* Deposit address */}
              <div>
                <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em] mb-1">To this address</div>
                <div className="bg-[var(--surface)] rounded-lg px-3 py-2.5 font-mono text-[13px] text-[var(--ink)] break-all select-all">
                  {paymentData.depositAddress}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[12px] text-amber-800">
                Send the <strong>exact amount</strong> shown above. The amount includes unique identifier cents to match your payment.
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-[13px] text-[var(--ink-2)]">
                <span className="w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
                Waiting for payment...
              </div>
            </div>
          )}

          {step === 'logo' && paymentData && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-[20px] font-bold text-[var(--ink)]">Payment confirmed</h4>
                <p className="text-[14px] text-[var(--ink-2)] mt-2">Upload your logo for admin approval before it appears on the board.</p>
              </div>
              <LogoUpload
                bidId={paymentData.bidId}
                uploadToken={paymentData.uploadToken}
                onSubmitted={() => setStep('done')}
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
                Spot #{spot.number} is yours. Your logo will appear after admin approval.
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
