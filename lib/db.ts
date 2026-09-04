import { PrismaClient } from '@prisma/client';

export const MACBOOK_SPOTS = [
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

let initPromise: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (globalForPrisma.dbInitialized) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Ensure board and spots exist
      let board = await db.board.findFirst();
      if (!board) {
        board = await db.board.create({
          data: {
            title: 'PulseChain MacBook Sticker Board',
            status: 'LIVE',
            totalRaised: 0,
          },
        });
      }

      for (const s of MACBOOK_SPOTS) {
        const existing = await db.spot.findUnique({
          where: { number: s.number },
        });

        if (!existing) {
          await db.spot.create({
            data: {
              boardId: board.id,
              number: s.number,
              position: s.position,
              size: s.size,
              tier: 'PHYSICAL',
              startingPrice: s.startingPrice,
              currentBid: 0,
              status: 'AVAILABLE',
              bidCount: 0,
              clicksCount: 0,
            },
          });
        }
      }

      // Ensure admin config
      const adminConfig = await db.adminConfig.findFirst();
      if (!adminConfig) {
        await db.adminConfig.create({
          data: {
            id: 'default_config',
            siteActive: true,
            pageViews: 0,
          },
        });
      }

      globalForPrisma.dbInitialized = true;
    } catch (err) {
      console.warn('ensureDatabase note:', err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}
