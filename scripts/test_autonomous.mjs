async function testAutonomousEngine() {
  console.log("\n=== TESTING AUTONOMOUS AI ENGINE & FIREBASE COVER IMAGE UPLOAD ===");

  try {
    const res = await fetch("http://localhost:3000/api/admin/autonomous", {
      headers: { Cookie: "admin_session=nkc-admin-secret-2026" },
    });
    const data = await res.json();
    console.log(`[TEST] GET /api/admin/autonomous Response Status: ${res.status}`);
    console.log("[TEST] Success:", data.success);

    if (data.success) {
      console.log("\n--- GENERATED ARTICLE ---");
      console.log("Title:", data.article?.title);
      console.log("Slug:", data.article?.slug);
      console.log("Cover Image URL (Firebase):", data.article?.coverImage);

      console.log("\n--- GENERATED RESEARCH PAPER ---");
      console.log("Title:", data.research?.title);
      console.log("Slug:", data.research?.slug);
      console.log("Cover Image URL (Firebase):", data.research?.coverImage);
    } else {
      console.error("[TEST] Error output:", data.error);
    }
  } catch (err) {
    console.error("[TEST] Network error:", err.message);
  }

  console.log("\n=== TEST COMPLETE ===\n");
}

testAutonomousEngine();
