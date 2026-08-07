import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

async function checkAdminOrCronSecret(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "nkc-cron-secret-2026";
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret === cronSecret) return true;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value || cookieStore.get("admin-token")?.value;
  const adminSecret = process.env.ADMIN_SESSION_TOKEN || "nkc-admin-secret-2026";
  return token === adminSecret;
}

// GET /api/admin/cron  — returns current schedule settings
export async function GET(request: Request) {
  try {
    const isAuthorized = await checkAdminOrCronSecret(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("aiconfig").findOne({}) || {};

    const schedule = {
      enabled:    config.autoPublishEnabled  ?? true,
      time:       config.autoPublishTime     || "08:00",
      timezone:   "Asia/Kathmandu",
      lastRun:    config.autoPublishLastRun  || null,
      lastStatus: config.autoPublishLastStatus || "IDLE",
    };

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    console.error("[Cron Engine] GET Error:", error);
    return NextResponse.json({ error: error.message || "Cron endpoint error" }, { status: 500 });
  }
}

// POST /api/admin/cron  — update schedule settings
// ⚠ CRITICAL FIX: do NOT reset autoPublishLastRun when saving — that would
//   make the engine think it's never run and fire immediately.
//   Only reset lastRun when the user explicitly changes the TIME value so
//   the new time can take effect today if it's already past.
export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminOrCronSecret(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, time } = body;

    const client = await clientPromise;
    const db = client.db();

    // Fetch the current saved time so we can detect a time change
    const current = await db.collection("aiconfig").findOne({}) || {};
    const currentTime = current.autoPublishTime || "08:00";
    const timeChanged = time && time !== currentTime;

    const updateFields: Record<string, any> = {
      autoPublishEnabled: Boolean(enabled),
      autoPublishTime:    time || currentTime,
      updatedAt:          new Date().toISOString(),
    };

    // Only reset lastRun when the scheduled TIME itself changes — this lets
    // the new time fire today if it's already past the old time.
    // If only toggling enabled/disabled, preserve lastRun so we don't double-publish.
    if (timeChanged) {
      console.log(`[Cron Engine] Time changed from ${currentTime} → ${time}. Resetting lastRun.`);
      updateFields.autoPublishLastRun = null;
    }

    await db.collection("aiconfig").updateOne(
      {},
      { $set: updateFields },
      { upsert: true }
    );

    console.log(
      `[Cron Engine] Schedule saved: enabled=${Boolean(enabled)}, time=${time || currentTime}, ` +
      `timeChanged=${timeChanged}`
    );

    return NextResponse.json({
      success: true,
      message: "Daily auto-publish schedule updated successfully.",
      schedule: { enabled: Boolean(enabled), time: time || currentTime },
    });
  } catch (error: any) {
    console.error("[Cron Engine] POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update cron schedule" }, { status: 500 });
  }
}
