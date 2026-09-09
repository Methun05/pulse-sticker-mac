import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — PulseSticker',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:py-24">
      <article className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
          &larr; Back
        </Link>

        <h1 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-[-0.03em] text-[var(--ink)] mt-6 mb-8">
          Terms of Service
        </h1>

        <div className="space-y-6 text-[15px] text-[var(--ink-2)] leading-relaxed">
          <p className="text-[13px] text-[var(--ink-3)]">Last updated: September 2026</p>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">What PulseSticker is</h2>
            <p>
              PulseSticker is a pay-to-rank leaderboard where anyone, whether a project, a community, or an individual,
              can sponsor a spot on a real MacBook. Your logo or brand is physically printed and placed on the laptop.
              This is not limited to companies. Anyone can bid to promote a token, a project, or themselves.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Bidding and outbidding</h2>
            <p>
              Spots are open to everyone. Any user can outbid an existing sponsor at any time.
              When outbid, the previous sponsor's sticker is replaced with the new highest bidder's logo.
              There is no limit to how many times a spot can change hands.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Payments and refunds</h2>
            <p>
              All crypto payments are final and non-refundable. By sending a transaction you acknowledge
              that blockchain transfers cannot be reversed. Your payment covers the visibility your brand
              received for the period you held the spot.
            </p>
            <p className="mt-2">
              Fiat payments are processed by DODO Payments. Fiat transactions are subject to{' '}
              <a href="#" className="underline hover:text-[var(--ink)]">[DODO Payments Terms of Service]</a> and{' '}
              <a href="#" className="underline hover:text-[var(--ink)]">[DODO Payments Privacy Policy]</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Uploaded content</h2>
            <p>
              Logos and brand names you upload are displayed publicly on the leaderboard and on the physical
              MacBook. By uploading, you confirm you have the right to use the content. PulseSticker reserves
              the right to reject or remove any content without notice.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Disclaimer</h2>
            <p>
              Stickers are paid placements, not endorsements. PulseSticker is not affiliated with Apple Inc.
              or any token project listed on the platform. The service is provided as-is with no guarantees
              of uptime or availability.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-[var(--ink)] mb-2">Contact</h2>
            <p>
              For any questions or requests, reach out on X:{' '}
              <a href="https://x.com/" className="underline hover:text-[var(--ink)]">[X handle — coming soon]</a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
