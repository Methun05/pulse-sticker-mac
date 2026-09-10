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
    // DePay sends base64url-encoded signatures
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
