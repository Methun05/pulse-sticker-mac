import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** Timing-safe string comparison using fixed-length hashes to prevent length leakage */
function safeCompare(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/** Check Authorization: Bearer header against ADMIN_PASSWORD env var */
export function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return false;
  return safeCompare(token, ADMIN_PASSWORD);
}

/** Return 401 or 503 response for unauthorized admin requests */
export function unauthorizedResponse(): NextResponse {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
