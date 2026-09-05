'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SpotData } from '@/components/laptop/MacBookMockup';

const SUPPORTED_TOKENS = ['USDC', 'USDT', 'DAI'] as const;
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 56, name: 'BSC' },
  { id: 8453, name: 'Base' },
  { id: 137, name: 'Polygon' },
  { id: 369, name: 'PulseChain' },
] as const;

type Step = 'form' | 'pay' | 'confirming' | 'done' | 'expired';

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
  const [logoUrl, setLogoUrl] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [token, setToken] = useState<string>('USDC');
  const [chainId, setChainId] = useState<number>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment state
  const [paymentData, setPaymentData] = useState<{
    bidId: string;
    paymentId: string;
    depositAddress: string;
    tokenAmount: string;
    tokenAmountDisplay: number;
    expiresAt: string;
    chainName: string;
  } | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen && spot) {
      setStep('form');
      setError('');
      setPaymentData(null);
      const min = spot.currentBid > 0 ? spot.currentBid + 1 : spot.startingPrice;
      setBidAmount(String(min));
    }
  }, [isOpen, spot]);

  const minBid = spot ? (spot.currentBid > 0 ? spot.currentBid + 1 : spot.startingPrice) : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spot) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotNumber: spot.number,
          bidAmount: parseFloat(bidAmount),
          brandName,
          website: website || undefined,
          logoUrl: logoUrl || undefined,
          walletAddress,
          token,
          chainId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to initiate payment');
        return;
      }
      setPaymentData(data);
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
        setStep('done');
        onConfirmed();
      } else if (data.status === 'EXPIRED') {
        setStep('expired');
      }
    } catch {
      // retry next interval
    }
  }, [paymentData, onConfirmed]);

  useEffect(() => {
    if (step !== 'pay' && step !== 'confirming') return;
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--hairline)]">
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--ink)]">
              {step === 'done' ? 'Bid confirmed!' : `Spot #${spot.number} — ${spot.position}`}
            </h3>
            <p className="text-[13px] text-[var(--ink-3)]">{spot.size}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="var(--ink-3)" strokeWidth="1.5"/></svg>
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Brand / Project name *</label>
                <input
                  type="text" required value={brandName} onChange={e => setBrandName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="e.g. PulseX"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Website</label>
                <input
                  type="url" value={website} onChange={e => setWebsite(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="https://pulsex.com"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Logo URL</label>
                <input
                  type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Your wallet address *</label>
                <input
                  type="text" required value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] font-mono focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Bid amount (USD) *</label>
                <input
                  type="number" required min={minBid} step="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--blue)] transition-colors"
                />
                <p className="text-[12px] text-[var(--ink-3)] mt-1">Minimum: ${minBid}</p>
              </div>

              {/* Token + Chain */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Token</label>
                  <select
                    value={token} onChange={e => setToken(e.target.value)}
                    className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] bg-white focus:outline-none focus:border-[var(--blue)]"
                  >
                    {SUPPORTED_TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink-2)] mb-1">Chain</label>
                  <select
                    value={chainId} onChange={e => setChainId(Number(e.target.value))}
                    className="w-full rounded-lg border border-[var(--hairline)] px-3 py-2 text-[14px] bg-white focus:outline-none focus:border-[var(--blue)]"
                  >
                    {SUPPORTED_CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-[13px] text-[var(--red)] bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[var(--blue)] hover:bg-[var(--blue-hover)] disabled:opacity-50 text-white py-3 text-[15px] font-medium transition-colors"
              >
                {loading ? 'Creating payment...' : `Bid $${bidAmount || minBid}`}
              </button>
            </form>
          )}

          {/* Step 2: Payment instructions */}
          {(step === 'pay' || step === 'confirming') && paymentData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--blue)]/10 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                </div>
                <h4 className="text-[17px] font-semibold text-[var(--ink)]">Send payment</h4>
                <p className="text-[13px] text-[var(--ink-3)] mt-1">Time remaining: <span className="font-mono font-medium text-[var(--ink)]">{timeLeft}</span></p>
              </div>

              {/* Amount */}
              <div className="bg-[var(--surface)] rounded-xl p-4 text-center">
                <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em] mb-1">Send exactly</div>
                <div className="text-[28px] font-bold tracking-[-0.02em] text-[var(--ink)]">
                  {paymentData.tokenAmountDisplay} {token}
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

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <h4 className="text-[20px] font-bold text-[var(--ink)]">You got the spot!</h4>
              <p className="text-[14px] text-[var(--ink-2)] mt-2">
                Spot #{spot.number} is now yours. Your sticker will be placed on the MacBook.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[var(--blue)] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--blue-hover)] transition-colors"
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
