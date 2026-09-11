import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db, ensureDatabase } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 500 * 1024; // 500KB

function imageExtension(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  return null;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'logo-upload' });
  if (rl) return rl;

  try {
    await ensureDatabase();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bidId = formData.get('bidId');
    const uploadToken = formData.get('uploadToken');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (typeof bidId !== 'string' || typeof uploadToken !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing upload authorization' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File must be PNG, JPG, or WEBP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File must be under 500KB' },
        { status: 400 }
      );
    }

    const uploadTokenHash = createHash('sha256').update(uploadToken).digest('hex');
    const bid = await db.bid.findFirst({
      where: { id: bidId, uploadTokenHash, status: { in: ['CONFIRMED', 'AWAITING_PAYMENT'] } },
      select: { id: true, logoStatus: true },
    });
    if (!bid) {
      return NextResponse.json({ success: false, error: 'Upload is not available for this bid' }, { status: 403 });
    }
    if (bid.logoStatus === 'APPROVED') {
      return NextResponse.json({ success: false, error: 'The approved logo cannot be replaced' }, { status: 409 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = imageExtension(bytes);
    if (!extension) {
      return NextResponse.json({ success: false, error: 'File content is not a supported image' }, { status: 400 });
    }

    // Reject polyglot files: scan for embedded HTML/script tags in binary content
    const textSample = new TextDecoder('ascii', { fatal: false }).decode(bytes);
    if (/<script|<svg|<html|<iframe|javascript:/i.test(textSample)) {
      return NextResponse.json({ success: false, error: 'File contains disallowed content' }, { status: 400 });
    }

    const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${mimeMap[extension]};base64,${base64}`;

    await db.bid.update({
      where: { id: bid.id },
      data: {
        logoUrl: dataUrl,
        logoStatus: 'APPROVED',
        logoUploadedAt: new Date(),
        logoReviewedAt: new Date(),
      },
    });

    // Re-read fresh from DB to avoid race with callback that may have set status concurrently
    const freshBid = await db.bid.findUnique({
      where: { id: bid.id },
      select: { id: true, status: true, spotId: true },
    });

    // Only update the spot's logo if the bid is confirmed
    if (freshBid?.status === 'CONFIRMED') {
      await db.spot.update({
        where: { id: freshBid.spotId },
        data: { currentLogoUrl: dataUrl },
      });
    }

    return NextResponse.json({ success: true, status: 'APPROVED' });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
