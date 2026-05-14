type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetIn: windowMs };
  }

  if (b.count >= max) {
    return { ok: false, remaining: 0, resetIn: b.resetAt - now };
  }

  b.count += 1;
  return { ok: true, remaining: max - b.count, resetIn: b.resetAt - now };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}, 60_000).unref?.();
