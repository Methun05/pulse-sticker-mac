import Link from 'next/link';

export const metadata = {
  title: 'Manifesto — PulseSticker',
  description: 'Why we\'re taking PulseChain to every corner of the world.',
};

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[14px] text-[var(--ink-3)] hover:text-[var(--ink-2)] transition-colors mb-12"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>

        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] leading-[1.1] text-[var(--ink)] mb-8">
          Taking PulseChain to every corner of the world.
        </h1>

        <div className="space-y-6 text-[16px] sm:text-[17px] text-[var(--ink-2)] leading-relaxed">
          <p>
            PulseChain has a strong community in Europe, the US, and Australia. But outside those circles, most people have never heard of it. I want to change that.
          </p>

          <p>
            I carry my MacBook everywhere — cafes, coworking spaces, airports, meetups, across countries. Every sticker on the lid is a conversation starter. When someone points at a logo and asks "What's that?", I don't just explain — I onboard them. Personally. I'll walk them through opening a wallet, and put $15–20 of real tokens in their hands so they have skin in the game from day one.
          </p>

          <p>
            That's what this project funds. PulseChain projects claim a sticker spot on this MacBook by paying crypto. Their brand travels with me. But the money doesn't just sit — 20% of all funds go straight back into the PulseChain community.
          </p>

          <h2 className="text-[22px] font-semibold text-[var(--ink)] pt-4">
            Where the money goes
          </h2>

          <p>
            The 20% community fund goes into things that actually grow the ecosystem: onboarding new holders with real tokens, creating tutorials, printing materials for community events, and building tools that make PulseChain more accessible to newcomers.
          </p>

          <h2 className="text-[22px] font-semibold text-[var(--ink)] pt-4">
            What sponsors get
          </h2>

          <p>
            Visibility — your logo on a MacBook that's seen in public every single day, across multiple countries. But more than that, you're funding the growth of the ecosystem you're already invested in. Every new holder, every conversation, every onboarded user makes PulseChain stronger. Your sponsorship isn't an ad — it's an investment in the community.
          </p>

          <h2 className="text-[22px] font-semibold text-[var(--ink)] pt-4">
            The bigger picture
          </h2>

          <p>
            This started with stickers on a laptop. But the vision is bigger. Community members printing PulseChain t-shirts for an event. Flyers for a local meetup. A group buy for conference merch. This page could become a hub where the PulseChain community crowdfunds anything that spreads the word — and everyone can pitch in.
          </p>

          <p>
            For now, it starts with 10 spots on one MacBook, and one person carrying PulseChain into rooms where nobody's heard of it yet.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--hairline)]">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[14px] text-base font-semibold transition-all duration-300 bg-[var(--ink)] text-white hover:opacity-90 h-10 px-6 hover:scale-[1.04] active:scale-[0.92]"
          >
            Claim a spot
          </Link>
        </div>
      </div>
    </main>
  );
}
