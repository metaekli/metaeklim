import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

describe("password hashing", () => {
  it("verifies a correct password against its hash", () => {
    const hash = hashPassword("<REDACTED-ADMIN-PASSWORD>");
    expect(verifyPassword("<REDACTED-ADMIN-PASSWORD>", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("<REDACTED-ADMIN-PASSWORD>");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});

describe("session tokens", () => {
  const secret = "test-secret";

  it("verifies a freshly created token", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, secret, 1000 * 60)).toBe(true);
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, "other-secret", 1000 * 60)).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, secret, -1)).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(verifySessionToken("not-a-token", secret, 1000 * 60)).toBe(false);
  });
});
