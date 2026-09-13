import crypto from 'crypto';

// DePay's public key for verifying incoming requests
const DEPAY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4J1dY7e68NtRjpssloQ0
zfTq8R1h4OxlX9GoKnZp+L5NBkw5AtZmdCYcXBQBHtiAv0nw9eKEH42gAcVUT7PY
Hpa9LiGtYMtJJVAWJmqbYOQXnwYtgmPKr7TZC7+SWyd8glRdmhEbrta6cZuvX7vw
k6QC3608StqOVxHsBw8+jbNIAuXQ4FQu3/2lT2fmtNVisEegY/3W3BGFRB4zuqvl
+IrqjzLmVBpwCTDUNQbFUWssRyhdgo3l3eh/GB9InYmzGAp65BHHurh4CpEiX08H
1hqTuYorZhQ4c9O7mZ9lLNDYpatFGgr1ueLkT/gDkBYg195uqaH/ISHagxo5CgHQ
nwIDAQAB
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
