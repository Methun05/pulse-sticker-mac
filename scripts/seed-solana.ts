import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // Find Spot #1
  const spot = await db.spot.findUnique({ where: { number: 1 } });
  if (!spot) {
    console.error('Spot #1 not found. Run the app first to bootstrap spots.');
    process.exit(1);
  }

  // Create a confirmed bid
  const bid = await db.bid.create({
    data: {
      spotId: spot.id,
      walletAddress: '0x0000000000000000000000000000000000000001',
      brandName: 'Solana',
      website: 'https://solana.com',
      logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
      email: null,
      xHandle: null,
      amount: 10,
      status: 'CONFIRMED',
    },
  });

  // Update spot to OCCUPIED
  await db.spot.update({
    where: { number: 1 },
    data: {
      currentBid: 10,
      currentBrandName: 'Solana',
      currentLogoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
      currentWebsite: 'https://solana.com',
      currentWallet: '0x0000000000000000000000000000000000000001',
      status: 'OCCUPIED',
      bidCount: 1,
    },
  });

  // Update board totalRaised
  await db.board.updateMany({
    data: { totalRaised: { increment: 10 } },
  });

  console.log('Seeded Solana on Spot #1:', bid.id);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
