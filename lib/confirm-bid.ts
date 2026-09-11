import { db, BID_EXPIRY_MS } from '@/lib/db';

export type ConfirmResult =
  | { alreadyConfirmed: true }
  | { error: string; status: number }
  | { amountMismatch: true; bidId: string; expected: number; received: number }
  | { outbidNoSpot: true; bidId: string; amount: number }
  | {
      confirmed: true;
      spotNumber: number;
      brandName: string;
      amount: number;
      reassigned?: true;
      newSpotNumber?: number;
    };

export async function confirmBidTransaction(params: {
  bidId: string;
  txHash: string | null;
  chainId: number;
  token: string;
  tokenAmount: string;
  depositAddress: string;
  walletAddress: string;
}): Promise<ConfirmResult> {
  const { bidId, txHash, chainId, token, tokenAmount, depositAddress, walletAddress } = params;

  return db.$transaction(async (tx) => {
    const bid = await tx.bid.findUnique({
      where: { id: bidId },
      include: { spot: { include: { board: true } } },
    });

    if (!bid) {
      return { error: 'Bid not found', status: 404 };
    }

    // Idempotent: if already confirmed, return success
    if (bid.status === 'CONFIRMED') {
      return { alreadyConfirmed: true };
    }

    if (bid.status !== 'AWAITING_PAYMENT') {
      console.warn(`[confirmBid] Rejecting invalid bid status: ${bidId} (status: ${bid.status})`);
      return { error: 'Bid is no longer valid', status: 400 };
    }

    // Reject expired bids
    const ageMs = Date.now() - new Date(bid.createdAt).getTime();
    if (ageMs > BID_EXPIRY_MS) {
      console.warn(`[confirmBid] Bid expired: ${bidId} (age ${Math.round(ageMs / 60000)}min)`);
      return { error: 'Bid has expired', status: 400 };
    }

    // Verify paid amount matches bid amount (skip for fiat — processor handles that)
    if (token !== 'FIAT') {
      const paidAmount = parseFloat(tokenAmount);
      const minAcceptable = bid.amount * 0.98; // 2% tolerance for fees/slippage

      if (isNaN(paidAmount) || paidAmount < minAcceptable) {
        console.warn(
          `[confirmBid] Amount mismatch: bid ${bidId} expected $${bid.amount}, received ${tokenAmount} (min $${minAcceptable.toFixed(2)})`
        );

        // Create REJECTED payment for paper trail (crypto — manual refund needed)
        await tx.payment.create({
          data: {
            bidId: bid.id,
            txHash,
            chainId,
            token,
            tokenAmount,
            usdAmount: bid.amount,
            depositAddress,
            walletAddress,
            status: 'REJECTED',
            refundStatus: 'PENDING',
            confirmedAt: new Date(),
          },
        });

        console.warn(
          `[confirmBid] REJECTED (amount mismatch) bid ${bid.id} ($${bid.amount}) — refund manual (crypto, sender: ${walletAddress})`
        );

        await tx.bid.update({
          where: { id: bid.id },
          data: { status: 'REJECTED' },
        });

        return { amountMismatch: true, bidId: bid.id, expected: bid.amount, received: paidAmount || 0 };
      }
    }

    // Lock the spot row to prevent concurrent confirmations (SELECT FOR UPDATE)
    await tx.$queryRaw`SELECT id FROM "Spot" WHERE id = ${bid.spotId} FOR UPDATE`;
    // Re-read spot with fresh data after acquiring lock
    const freshSpot = await tx.spot.findUnique({ where: { id: bid.spotId } });
    if (!freshSpot) {
      return { error: 'Spot not found', status: 404 };
    }

    // Track which spot we'll confirm on (may change if outbid + reassigned)
    let targetSpotId = bid.spotId;
    let targetSpotNumber = freshSpot.number;
    let targetBoardId = bid.spot.boardId;
    let reassigned = false;

    // Check if outbid on original spot (using fresh data after lock)
    if (freshSpot.currentBid > 0 && bid.amount <= freshSpot.currentBid) {
      console.warn(
        `[confirmBid] Bid ${bid.id}: amount $${bid.amount} <= current $${bid.spot.currentBid} on Spot #${bid.spot.number}, looking for free spot`
      );

      // Find and atomically claim a free spot.
      // Loop because another transaction may claim the spot between findFirst and updateMany.
      let claimedSpot: { id: string; number: number } | null = null;
      const alreadyTriedIds: string[] = [];

      while (!claimedSpot) {
        const freeSpot = await tx.spot.findFirst({
          where: {
            boardId: targetBoardId,
            status: 'AVAILABLE',
            startingPrice: { lte: bid.amount },
            id: { notIn: alreadyTriedIds },
          },
          orderBy: [{ startingPrice: 'desc' }, { number: 'asc' }],
        });

        if (!freeSpot) {
          // No free spot available — create REJECTED payment for paper trail
          const isFiat = chainId === 0;
          await tx.payment.create({
            data: {
              bidId: bid.id,
              txHash,
              chainId,
              token,
              tokenAmount,
              usdAmount: bid.amount,
              depositAddress,
              walletAddress,
              status: 'REJECTED',
              refundStatus: 'PENDING',
              confirmedAt: new Date(),
            },
          });

          console.warn(
            `[confirmBid] No free spot for outbid bid ${bid.id} ($${bid.amount}) — ` +
            `refund ${isFiat ? 'auto (fiat)' : `manual (crypto, sender: ${walletAddress})`}`
          );
          return { outbidNoSpot: true, bidId: bid.id, amount: bid.amount };
        }

        // Atomically claim: only succeeds if spot is still AVAILABLE
        const claimed = await tx.spot.updateMany({
          where: { id: freeSpot.id, status: 'AVAILABLE' },
          data: { status: 'OCCUPIED' },
        });

        if (claimed.count > 0) {
          claimedSpot = { id: freeSpot.id, number: freeSpot.number };
        } else {
          // Spot was claimed by another transaction — try next one
          alreadyTriedIds.push(freeSpot.id);
        }
      }

      // Reassign bid to the claimed spot
      await tx.bid.update({
        where: { id: bid.id },
        data: { spotId: claimedSpot.id },
      });

      targetSpotId = claimedSpot.id;
      targetSpotNumber = claimedSpot.number;
      reassigned = true;

      console.log(
        `[confirmBid] Reassigned bid ${bid.id} from Spot #${bid.spot.number} to Spot #${claimedSpot.number}`
      );
    }

    // Create Payment record
    await tx.payment.create({
      data: {
        bidId: bid.id,
        txHash,
        chainId,
        token,
        tokenAmount,
        usdAmount: bid.amount,
        depositAddress,
        walletAddress,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Mark previous CONFIRMED bids on target spot → OUTBID
    await tx.bid.updateMany({
      where: {
        spotId: targetSpotId,
        id: { not: bid.id },
        status: 'CONFIRMED',
      },
      data: { status: 'OUTBID' },
    });

    // Confirm this bid
    await tx.bid.update({
      where: { id: bid.id },
      data: { status: 'CONFIRMED' },
    });

    // Update spot with new highest bidder
    await tx.spot.update({
      where: { id: targetSpotId },
      data: {
        currentBid: bid.amount,
        currentBrandName: bid.brandName,
        currentLogoUrl: bid.logoUrl,
        currentWebsite: bid.website,
        currentEmail: bid.email,
        currentXHandle: bid.xHandle,
        currentWallet: walletAddress,
        status: 'OCCUPIED',
        bidCount: { increment: 1 },
      },
    });

    // Recalculate total raised (atomic SQL SUM to avoid race conditions)
    const [{ sum }] = await tx.$queryRaw<[{ sum: number }]>`
      SELECT COALESCE(SUM("currentBid"), 0) as sum
      FROM "Spot"
      WHERE "boardId" = ${targetBoardId}
    `;

    await tx.board.update({
      where: { id: targetBoardId },
      data: { totalRaised: sum },
    });

    const result: ConfirmResult = {
      confirmed: true,
      spotNumber: targetSpotNumber,
      brandName: bid.brandName,
      amount: bid.amount,
    };

    if (reassigned) {
      (result as { reassigned: true; newSpotNumber: number }).reassigned = true;
      (result as { newSpotNumber: number }).newSpotNumber = targetSpotNumber;
    }

    return result;
  });
}
