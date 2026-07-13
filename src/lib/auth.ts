import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

const SESSION_VALUE = "authenticated";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, 64);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createSessionToken(secret: string): string {
  const payload = `${SESSION_VALUE}.${Date.now()}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token: string, secret: string, maxAgeMs: number): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  const [value, tsStr] = payload.split(".");
  if (value !== SESSION_VALUE) return false;

  const issuedAt = Number(tsStr);
  if (!Number.isFinite(issuedAt)) return false;

  return Date.now() - issuedAt <= maxAgeMs;
}
