import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorized, unauthorizedResponse } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Changed from GET to POST — state mutation must not be on GET
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'admin-views' });
  if (rl) return rl;

  if (!isAuthorized(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const count = typeof body.count === 'number' ? body.count : 210;

    if (isNaN(count) || count < 0) {
      return NextResponse.json({ error: 'Invalid count' }, { status: 400 });
    }

    const config = await db.adminConfig.upsert({
      where: { id: 'default_config' },
      update: { pageViews: count },
      create: { id: 'default_config', pageViews: count },
    });

    return NextResponse.json({
      success: true,
      message: `Total views updated to ${config.pageViews}`,
      pageViews: config.pageViews,
    });
  } catch (error: unknown) {
    console.error('Set views error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
