/**
 * Sliding Window Token-Bucket Rate Limiter
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests in window
  windowMs: number;   // Window size in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 20, windowMs: 60 * 1000 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + options.windowMs;
    store.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: resetTime,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count += 1;
  store.set(identifier, record);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: record.resetTime,
  };
}
