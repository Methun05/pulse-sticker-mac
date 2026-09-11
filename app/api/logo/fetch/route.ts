import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { bytesToDataUrl } from '@/lib/image-validation';

const FETCH_TIMEOUT = 5000;
const MAX_SIZE = 500 * 1024; // 500KB

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  if (!isHttpUrl(url)) throw new Error('Invalid URL');
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_SIZE) throw new Error('Image too large');
  return new Uint8Array(buf);
}

/** Try to extract a logo from a domain via Google Favicon API + HTML meta fallback. */
async function fetchFromDomain(domain: string): Promise<string> {
  // 1. Try Google Favicon API (128px)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  try {
    const bytes = await fetchImageBytes(faviconUrl);
    // Google returns a tiny default globe icon (~200 bytes) for unknown domains
    if (bytes.length > 200) {
      return bytesToDataUrl(bytes);
    }
  } catch {
    // Fall through to HTML parsing
  }

  // 2. Fetch homepage HTML and look for og:image, apple-touch-icon, or link[rel=icon]
  const homepageUrl = `https://${domain}`;
  let html: string;
  try {
    const res = await fetchWithTimeout(homepageUrl);
    if (!res.ok) throw new Error('Homepage fetch failed');
    html = await res.text();
  } catch {
    throw new Error('Could not fetch logo from this domain');
  }

  const candidates: string[] = [];

  // og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch?.[1]) candidates.push(ogMatch[1]);

  // apple-touch-icon
  const appleMatch = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);
  if (appleMatch?.[1]) candidates.push(appleMatch[1]);

  // link[rel=icon]
  const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
  if (iconMatch?.[1]) candidates.push(iconMatch[1]);

  // Try each candidate
  for (const raw of candidates) {
    let url = raw;
    if (url.startsWith('//')) url = `https:${url}`;
    else if (url.startsWith('/')) url = `https://${domain}${url}`;
    if (!isHttpUrl(url)) continue;

    try {
      const bytes = await fetchImageBytes(url);
      return bytesToDataUrl(bytes);
    } catch {
      continue;
    }
  }

  throw new Error('No logo found for this domain');
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'logo-fetch' });
  if (rl) return rl;

  try {
    const body = await request.json();
    const { domain, url } = body as { domain?: string; url?: string };

    if (domain) {
      // Domain mode: auto-fetch logo
      const cleaned = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
      if (!cleaned) {
        return NextResponse.json({ success: false, error: 'Invalid domain' }, { status: 400 });
      }
      const dataUrl = await fetchFromDomain(cleaned);
      return NextResponse.json({ success: true, dataUrl });
    }

    if (url) {
      // URL mode: fetch direct image
      if (!isHttpUrl(url)) {
        return NextResponse.json({ success: false, error: 'URL must start with http:// or https://' }, { status: 400 });
      }
      const bytes = await fetchImageBytes(url);
      const dataUrl = bytesToDataUrl(bytes);
      return NextResponse.json({ success: true, dataUrl });
    }

    return NextResponse.json({ success: false, error: 'Provide domain or url' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch logo';
    return NextResponse.json({ success: false, error: message }, { status: 422 });
  }
}
