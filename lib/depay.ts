import crypto from 'crypto';

// DePay's public key for verifying incoming requests
const DEPAY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuaVw8JleJdFaulFJHnTz
T5rHKmCgnMrdxN/hGRGccIJnugfiC5Cq4fdjuW0C3D6pvbRIetV+OtTu9PL4K6UT
44wUt1L7eULB6g8JJ0z8rJEhTe79tD5UwHFLpMNgv7coAmTbzAgSdNDomrru/ZgT
IO3LEiyf49434A0HBVp1hZVCXVhVzzpdNyz50hFO4jjmnBhtlmBIHQyXWfVOzQiz
ot7GirKqYgz7NqOUkrQ1MW24nBqIx/ByBZIIf/jDu2Z9sxbgXadRBHBRoAtjExn3
Z4/1BT6OxxLgujMWuYjWcUrIt7lE8hze0UEgciPIlRymSvyIyka2d4cgcgimf6U2
VQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Verify that a request is genuinely from DePay using RSA-PSS signature.
 */
export function verifyDepayRequest(body: string, signature: string | null): boolean {
  if (!signature) return false;

  try {
    const sigBuffer = Buffer.from(signature, 'base64');

    return crypto.verify(
      'sha256',
      Buffer.from(body),
      {
        key: DEPAY_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 64,
      },
      sigBuffer
    );
  } catch {
    return false;
  }
}

/**
 * Sign our response so DePay can verify it came from us.
 * Uses RSA-PSS SHA256 with salt length 64, base64url encoding.
 */
export function signResponse(data: string): string {
  const privateKeyPem = process.env.DEPAY_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKeyPem) throw new Error('DEPAY_PRIVATE_KEY not set');

  const privateKey = crypto.createPrivateKey(privateKeyPem);

  const signature = crypto.sign('sha256', Buffer.from(data), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 64,
  });

  // Base64url encoding (DePay convention)
  return signature.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
