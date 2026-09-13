import crypto from 'crypto';

// DePay's public key for verifying incoming requests
const DEPAY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl3Qg7NkLHOMiOZL4+fCs
a+qDYAUH3sB8WQ4wUZV3ZoJNewTc8hYiyezR8RaPezOWceUkMqcpcYvD6vCCVz2W
0sQekxRgKFReiDI8raufwVDWm/FdWsIDqAFRxK71u3V1/jUGGt1f40SSutD7OvI4
4C7SrSe5K1nYOWkGtsKaTisO629LtmCejbfOoElBQvdW3nnPf+euk+zFG3AL4cBo
x43/xUJwDzEPbDiJyqJr6Ht1PYORHvlpcFp02sJjRIxePukrUdLv1OnG72VQCKnt
B6Y5ZBEHHM4q6a/cozCuCa0WLU1mz7QzI96gZb50wk57b/WrrvRig/VYvraje45d
kQIDAQAB
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
