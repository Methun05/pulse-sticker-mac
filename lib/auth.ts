import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** Timing-safe string comparison */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
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
