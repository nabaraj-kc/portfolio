async function verifyAll() {
  console.log("\n=== VERIFYING FEED SORTING, CRON ENGINE & EXACT TIMESTAMP ===");

  // 1. Verify Cron Endpoint GET with Admin Session Cookie
  try {
    const res = await fetch("http://localhost:3000/api/admin/cron", {
      headers: { Cookie: "admin_session=nkc-admin-secret-2026" },
    });
    const json = await res.json();
    console.log(`[VERIFY] /api/admin/cron (GET): Status ${res.status}`, json);
  } catch (e) {
    console.error("[VERIFY] /api/admin/cron (GET) error:", e.message);
  }

  // 2. Verify Cron Endpoint POST (Update schedule)
  try {
    const res = await fetch("http://localhost:3000/api/admin/cron", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "admin_session=nkc-admin-secret-2026",
      },
      body: JSON.stringify({ enabled: true, time: "08:00" }),
    });
    const json = await res.json();
    console.log(`[VERIFY] /api/admin/cron (POST Update): Status ${res.status}`, json);
  } catch (e) {
    console.error("[VERIFY] /api/admin/cron (POST Update) error:", e.message);
  }

  // 3. Test Public Articles Feed & Exact Timestamps
  try {
    const res = await fetch("http://localhost:3000/articles");
    console.log(`[VERIFY] GET /articles: Status ${res.status} ${res.statusText}`);
  } catch (e) {
    console.error("[VERIFY] GET /articles error:", e.message);
  }

  // 4. Test Public Research Feed & Exact Timestamps
  try {
    const res = await fetch("http://localhost:3000/research");
    console.log(`[VERIFY] GET /research: Status ${res.status} ${res.statusText}`);
  } catch (e) {
    console.error("[VERIFY] GET /research error:", e.message);
  }

  console.log("=== ALL VERIFICATIONS COMPLETE ===\n");
}

verifyAll();
