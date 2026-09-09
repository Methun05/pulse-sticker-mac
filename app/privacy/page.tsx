import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — PulseSticker',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:py-24">
      <article className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
          &larr; Back
        </Link>

        <h1 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mt-6 mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-[15px] text-[var(--ink-2)] leading-relaxed">
          <p className="text-[13px] text-[var(--ink-3)]">Last updated: September 2026</p>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">What we collect</h2>
            <p>
              PulseSticker does not use cookies. We do not track you across the web and we do not
              collect personal data beyond what you voluntarily provide when placing a bid (brand name,
              website, email, wallet address, X handle).
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">How your data is stored</h2>
            <p>
              All information submitted through the platform is stored using AES-256 grade encryption.
              Access is restricted and data is never sold or shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Uploaded logos</h2>
            <p>
              Logos you upload are publicly visible on the leaderboard page and on the physical MacBook.
              By uploading a logo you understand it will be displayed publicly.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Fiat payments</h2>
            <p>
              Fiat payments are handled by DODO Payments. Your card or payment details are processed
              entirely by DODO and never touch our servers. See{' '}
              <a href="#" className="underline hover:text-[var(--ink)]">[DODO Payments Privacy Policy]</a>{' '}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Contact</h2>
            <p>
              To request data deletion or for any privacy-related questions, reach out on X:{' '}
              <a href="https://x.com/" className="underline hover:text-[var(--ink)]">[X handle — coming soon]</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
