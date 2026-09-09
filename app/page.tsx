'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { SpotData } from '@/components/laptop/MacBookMockup';
import { EcosystemSection } from '@/components/sections/EcosystemSection';
import { LeaderboardSection } from '@/components/sections/LeaderboardSection';
import { WhySponsorSection } from '@/components/sections/WhySponsorSection';
import { MyMacBookSection } from '@/components/sections/MyMacBookSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { BidModal } from '@/components/spots/BidModal';

export default function HomePage() {
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/board', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.spots?.length > 0) {
        setSpots(data.spots);
      }
      if (data.board) {
        setTotalRaised(data.board.totalRaised ?? 0);
      }
    } catch (e) {
      console.warn('Could not fetch board:', e);
    }
  }, []);

  useEffect(() => {
    loadBoard();
    const interval = setInterval(loadBoard, 5000);
    return () => clearInterval(interval);
  }, [loadBoard]);

  const handleSpotSelect = (spot: SpotData) => {
    setSelectedSpot(spot);
    setIsBidModalOpen(true);
  };

  const handleOpenGeneralBid = () => {
    const available = spots.find(s => s.currentBid === 0) || spots[0];
    if (available) handleSpotSelect(available);
  };

  const occupiedCount = spots.filter(s => s.currentBid > 0).length;

  return (
    <main className="min-h-screen bg-white">
      <Navbar onBidClick={handleOpenGeneralBid} totalRaised={totalRaised} />

      <HeroSection
        onBidClick={handleOpenGeneralBid}
        totalRaised={totalRaised}
        occupiedCount={occupiedCount}
      />

      <EcosystemSection />
      <LeaderboardSection spots={spots} onSelectSpot={handleSpotSelect} />
      <WhySponsorSection />
      <MyMacBookSection />
<FAQSection />
      <Footer />

      {/* Bid modal */}
      <BidModal
        spot={selectedSpot}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onConfirmed={loadBoard}
      />
    </main>
  );
}
