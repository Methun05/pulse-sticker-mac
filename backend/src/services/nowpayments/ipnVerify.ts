import crypto from "crypto";

/**
 * Recursively sorts object keys alphabetically (arrays keep their order,
 * their elements are sorted if they're objects). This matches NOWPayments'
 * own IPN-verification example code (they sort keys before
 * JSON.stringify-ing the body for the HMAC), which is the documented
 * gotcha: a plain re-stringify of the parsed body without sorting keys
 * will not reproduce the signature they send, since key order in the
 * incoming JSON is not guaranteed to already be sorted.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Verifies a NOWPayments IPN callback. Given the already-JSON-parsed
 * request body and the `x-nowpayments-sig` header, recomputes the
 * HMAC-SHA512 (hex) over the body with its keys sorted and compares it to
 * the header, using a constant-time comparison.
 */
export function verifyIpnSignature(
  body: unknown,
  signatureHeader: string | undefined,
  ipnSecret: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const sortedBody = sortKeysDeep(body);
  const payload = JSON.stringify(sortedBody);

  const expectedSignature = crypto
    .createHmac("sha512", ipnSecret)
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const actualBuffer = Buffer.from(signatureHeader, "utf-8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
