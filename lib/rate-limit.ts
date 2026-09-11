import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Use Upstash Redis in production, fall back to in-memory for local dev
const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// Cache limiter instances by prefix+config to avoid re-creating
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(maxRequests: number, windowMs: number, prefix: string): Ratelimit {
  const key = `${prefix}:${maxRequests}:${windowMs}`;
  let limiter = limiterCache.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: `rl:${prefix}`,
    });
    limiterCache.set(key, limiter);
  }
  return limiter;
}

// In-memory fallback for local development
interface MemEntry { count: number; resetAt: number }
const memStore = new Map<string, MemEntry>();

function getIp(request: NextRequest): string {
  // Prefer request.ip (set by Vercel, cannot be spoofed by client)
  // Fall back to headers only for local dev where request.ip is undefined
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Rate limiter that works both locally (in-memory) and on Vercel (Upstash Redis).
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 */
export async function rateLimit(
  request: NextRequest,
  opts: { maxRequests: number; windowMs: number; prefix?: string }
): Promise<NextResponse | null> {
  const ip = getIp(request);
  const prefix = opts.prefix || 'global';

  // Upstash path (production)
  if (redis) {
    const limiter = getUpstashLimiter(opts.maxRequests, opts.windowMs, prefix);
    const { success, reset } = await limiter.limit(`${prefix}:${ip}`);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } }
      );
    }
    return null;
  }

  // In-memory fallback (local dev)
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > opts.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  return null;
}
