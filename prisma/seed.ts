import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MACBOOK_SPOTS = [
  { number: 1, position: 'Center Lid', size: 'XL', startingPrice: 5 },
  { number: 2, position: 'Upper Left', size: 'Large', startingPrice: 3 },
  { number: 3, position: 'Upper Right', size: 'Large', startingPrice: 3 },
  { number: 4, position: 'Mid Left', size: 'Medium', startingPrice: 2 },
  { number: 5, position: 'Mid Right', size: 'Medium', startingPrice: 2 },
  { number: 6, position: 'Lower Left', size: 'Medium', startingPrice: 2 },
  { number: 7, position: 'Lower Center', size: 'Large', startingPrice: 3 },
  { number: 8, position: 'Lower Right', size: 'Medium', startingPrice: 2 },
  { number: 9, position: 'Bottom Left', size: 'Small', startingPrice: 1 },
  { number: 10, position: 'Bottom Right', size: 'Small', startingPrice: 1 },
];

async function main() {
  console.log('Seeding PulseChain MacBook Sticker Board...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.board.deleteMany();
  await prisma.adminConfig.deleteMany();

  // Create board
  const board = await prisma.board.create({
    data: {
      title: 'PulseChain MacBook Sticker Board',
      status: 'LIVE',
      totalRaised: 0,
    },
  });

  // Create spots
  for (const spotData of MACBOOK_SPOTS) {
    await prisma.spot.create({
      data: {
        boardId: board.id,
        number: spotData.number,
        position: spotData.position,
        size: spotData.size,
        tier: 'PHYSICAL',
        startingPrice: spotData.startingPrice,
        currentBid: 0,
        status: 'AVAILABLE',
        bidCount: 0,
        clicksCount: 0,
      },
    });
  }

  // Create admin config
  await prisma.adminConfig.create({
    data: {
      id: 'default_config',
      siteActive: true,
      pageViews: 0,
    },
  });

  console.log(`Seeded: 1 board, ${MACBOOK_SPOTS.length} spots, admin config`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
