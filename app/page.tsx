'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { HPLaptopMockup } from '@/components/laptop/HPLaptopMockup';
import { LiveAuctionSection } from '@/components/sections/LiveAuctionSection';
import { SpotCardGrid } from '@/components/auction/SpotCardGrid';
import { BidModal } from '@/components/auction/BidModal';
import { OutbidBanner } from '@/components/auction/OutbidBanner';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { SpotData } from '@/components/laptop/LaptopSpotZone';
import { INITIAL_SPOTS } from '@/lib/demo-data';

export default function HomePage() {
  const [spots, setSpots] = useState<SpotData[]>(
    INITIAL_SPOTS.map((s) => ({
      ...s,
      id: `spot_${s.number}`,
      stickerStatus: 'PENDING',
      clicksCount: 0,
    }))
  );

  const [auction, setAuction] = useState({
    id: 'default_auction',
    status: 'ACTIVE',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    totalRaised: 0,
  });

  const [liveStats, setLiveStats] = useState<any>({
    totalSales: 0,
    occupiedCount: 0,
    totalSpots: 10,
    totalClicks: 0,
    totalBidsCount: 0,
    liveVisitors: 1,
    totalViews: 1,
    highestBid: null,
    recentBids: [],
  });

  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const loadBoardData = useCallback(async () => {
    try {
      const res = await fetch('/api/board', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.board) {
        setAuction(prev => ({
          ...prev,
          id: data.board.id,
          status: data.board.status === 'PAUSED' ? 'CLOSED' : 'ACTIVE',
          totalRaised: data.board.totalRaised ?? 0,
        }));
      }
      if (data.spots?.length > 0) {
        setSpots(data.spots.map((s: any) => ({
          ...s,
          brandName: s.brandName || null,
          stickerStatus: s.status === 'OCCUPIED' ? 'ACTIVE' : 'PENDING',
          clicksCount: s.clicksCount ?? 0,
        })));
      }
      if (data.stats) {
        setLiveStats((prev: any) => ({
          ...prev,
          totalSales: data.stats.totalRaised ?? 0,
          occupiedCount: data.stats.occupiedSpots ?? 0,
          totalSpots: data.stats.totalSpots ?? 10,
          totalBidsCount: data.stats.totalBids ?? 0,
        }));
      }
    } catch (e) {
      console.warn('Could not fetch board:', e);
    }
  }, []);

  useEffect(() => {
    // Record 1 page view per visitor session
    try {
      if (!sessionStorage.getItem('bml_pv_recorded')) {
        sessionStorage.setItem('bml_pv_recorded', '1');
        fetch('/api/analytics/view', { method: 'POST' }).catch(() => {});
      }
    } catch {}

    loadBoardData();
    const interval = setInterval(loadBoardData, 5000);
    return () => clearInterval(interval);
  }, [loadBoardData]);

  const handleSpotSelect = (spot: SpotData) => {
    setSelectedSpot(spot);
    setIsBidModalOpen(true);
  };

  const handleOpenGeneralBid = () => {
    const targetSpot = spots.find((s) => s.currentBid === 0) || spots[0];
    setSelectedSpot(targetSpot || null);
    setIsBidModalOpen(true);
  };

  const scrollToAuction = () => {
    const el = document.getElementById('auction');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const isAuctionClosed = auction?.status === 'CLOSED';
  const occupiedCount = spots.filter((s) => s.currentBid > 0).length;

  return (
    <main className="min-h-screen bg-black text-[#f3f3ee]">
      <Navbar
        onBidClick={handleOpenGeneralBid}
        auctionClosed={isAuctionClosed}
        liveVisitors={liveStats?.liveVisitors ?? 1}
        totalViews={liveStats?.totalViews ?? 1}
      />

      <OutbidBanner spots={spots} onBidAgain={handleSpotSelect} />

      <HeroSection onBidClick={handleOpenGeneralBid} onExploreAuction={scrollToAuction} />

      {/* HP Laptop Centerpiece */}
      <section className="px-2 sm:px-6 pt-4 pb-2">
        <HPLaptopMockup
          spots={spots}
          selectedSpot={selectedSpot}
          onSelectSpot={handleSpotSelect}
          auctionClosed={isAuctionClosed}
        />
      </section>

      {/* 10 Spots Auction Grid */}
      <section id="auction" className="py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <LiveAuctionSection
            endTime={auction?.endTime || new Date(Date.now() + 72 * 60 * 60 * 1000)}
            occupiedCount={occupiedCount}
            auctionClosed={isAuctionClosed}
            hasStarted={occupiedCount > 0}
          />
          <SpotCardGrid
            spots={spots}
            onBidClick={handleSpotSelect}
            auctionClosed={isAuctionClosed}
          />
        </div>
      </section>

      <HowItWorksSection />
      <FAQSection />
      <Footer onBidClick={handleOpenGeneralBid} />

      {/* Bid Modal Dialog */}
      <BidModal
        spot={selectedSpot}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        auctionClosed={isAuctionClosed}
      />
    </main>
  );
}
