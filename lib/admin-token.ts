import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function secret(): string {
  const s = process.env.INSIGHT_TOKEN_SECRET;
  if (!s || s.length < 16) {
    throw new Error("INSIGHT_TOKEN_SECRET is not set or too short");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function signCommentToken(commentId: string): string {
  const expiry = Date.now() + TOKEN_TTL_MS;
  const nonce = b64url(randomBytes(8));
  const payload = `${commentId}.${expiry}.${nonce}`;
  const sig = sign(payload);
  return b64url(Buffer.from(`${payload}.${sig}`));
}

export function verifyCommentToken(token: string): { ok: true; commentId: string } | { ok: false; reason: string } {
  try {
    const raw = fromB64url(token).toString("utf-8");
    const parts = raw.split(".");
    if (parts.length !== 4) return { ok: false, reason: "malformed" };
    const [commentId, expiryStr, nonce, sig] = parts;
    const expiry = Number(expiryStr);
    if (!Number.isFinite(expiry) || expiry < Date.now()) {
      return { ok: false, reason: "expired" };
    }
    const expected = sign(`${commentId}.${expiry}.${nonce}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "bad_signature" };
    }
    return { ok: true, commentId };
  } catch {
    return { ok: false, reason: "decode_failed" };
  }
}

export function checkAdminSecret(provided: string | undefined | null): boolean {
  const expected = process.env.ADMIN_APPROVAL_SECRET;
  if (!expected || expected.length < 16) return false;
  if (!provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
