const MIME_MAP: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

/** Detect image type from magic bytes. Returns extension or null. */
export function imageExtension(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  return null;
}

/** Reject polyglot files with embedded script/svg/html. Returns error string or null. */
export function checkPolyglot(bytes: Uint8Array): string | null {
  const textSample = new TextDecoder('ascii', { fatal: false }).decode(bytes);
  if (/<script|<svg|<html|<iframe|javascript:/i.test(textSample)) {
    return 'File contains disallowed content';
  }
  return null;
}

/** Validate image bytes and convert to data URL. Returns data URL or throws. */
export function bytesToDataUrl(bytes: Uint8Array): string {
  const extension = imageExtension(bytes);
  if (!extension) throw new Error('File content is not a supported image');

  const polyglotError = checkPolyglot(bytes);
  if (polyglotError) throw new Error(polyglotError);

  const base64 = Buffer.from(bytes).toString('base64');
  return `data:${MIME_MAP[extension]};base64,${base64}`;
}
