/**
 * Next.js Instrumentation — Server-Side Scheduler (local dev only)
 *
 * In production, Vercel Cron triggers /api/cron/publish every 15 minutes.
 * In local dev (no Vercel Cron), this file simulates that behaviour by
 * polling the same endpoint every 60 seconds so the engine still fires.
 *
 * The endpoint itself contains all the timezone logic, idempotency guards,
 * and "already ran today" checks — so calling it frequently is safe.
 */

export async function register() {
  // Only run in the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Skip in production — Vercel Cron handles it there
  if (process.env.NODE_ENV === "production") return;

  const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const CRON_SECRET = process.env.CRON_SECRET || "nkc-cron-secret-2026";

  async function tick() {
    try {
      const res = await fetch(`${BASE_URL}/api/cron/publish`, {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
        signal:  AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        if (res.status !== 404) { // ignore during cold start
          console.error(`[LocalCron] Non-OK response ${res.status}:`, txt.slice(0, 200));
        }
        return;
      }

      const data = await res.json();
      if (data.executedNow) {
        console.log(
          `[LocalCron] ✅ Auto-publish fired! ` +
          `Article: "${data.article?.title}" | Research: "${data.research?.title}"`
        );
      } else {
        // Only log "skip" once every 10 minutes to keep logs clean
        const now = new Date();
        if (now.getMinutes() % 10 === 0 && now.getSeconds() < 60) {
          console.log(`[LocalCron] ⏭ Skipped — ${data.reason || "not yet time"}`);
        }
      }
    } catch (e: any) {
      // Suppress ECONNREFUSED during server startup
      if (!e.message?.includes("ECONNREFUSED") && !e.message?.includes("ENOTFOUND")) {
        console.error("[LocalCron] Tick error:", e.message);
      }
    }
  }

  // Wait 20 s for the server to be fully ready, then poll every 60 s
  setTimeout(() => {
    console.log(
      "[LocalCron] 🚀 Local dev scheduler active — " +
      "polling /api/cron/publish every 60 s (Vercel Cron handles production)"
    );
    tick();
    setInterval(tick, 60_000);
  }, 20_000);
}
