import { NextRequest, NextResponse } from 'next/server';
import { recordPageView } from '@/lib/presence';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: 'analytics' });
  if (rl) return rl;

  try {
    const views = await recordPageView();
    return NextResponse.json({ success: true, views });
  } catch (error: unknown) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
