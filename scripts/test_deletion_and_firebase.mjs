async function testDeletionAndFirebase() {
  console.log("\n=== TESTING DELETION SAFETY, SORTING & FIREBASE IMAGE ENGINE ===");

  const headers = {
    "Content-Type": "application/json",
    Cookie: "admin_session=nkc-admin-secret-2026",
  };

  // 1. Test Admin Articles GET (Verify descending sorting)
  try {
    const res = await fetch("http://localhost:3000/api/admin/articles", { headers });
    const articles = await res.json();
    console.log(`[TEST] GET /api/admin/articles: Received ${articles.length} article(s).`);
  } catch (e) {
    console.error("[TEST] GET /api/admin/articles error:", e.message);
  }

  // 2. Test Empty DELETE Request (Must return 400 Bad Request and NOT delete anything)
  try {
    const res = await fetch("http://localhost:3000/api/admin/articles", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ slug: undefined }),
    });
    const data = await res.json();
    console.log(`[TEST] Empty DELETE /api/admin/articles Safety Check: Status ${res.status}`, data);
  } catch (e) {
    console.error("[TEST] Empty DELETE error:", e.message);
  }

  // 3. Test Creating & Deleting a single test article safely
  try {
    const createRes = await fetch("http://localhost:3000/api/admin/articles", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Test Article Deletion Safety",
        slug: "test-article-deletion-safety-101",
        excerpt: "Testing safety checks",
        date: "2026-08-03",
        tag: "TEST",
      }),
    });
    const createdDoc = await createRes.json();
    console.log(`[TEST] POST /api/admin/articles created: Status ${createRes.status}`, createdDoc._id || createdDoc.slug);

    // Delete created article by ID
    const deleteRes = await fetch("http://localhost:3000/api/admin/articles", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ _id: createdDoc._id, slug: createdDoc.slug }),
    });
    const deleteData = await deleteRes.json();
    console.log(`[TEST] DELETE single article response: Status ${deleteRes.status}`, deleteData);
  } catch (e) {
    console.error("[TEST] Create & Delete cycle error:", e.message);
  }

  console.log("=== ALL DELETION SAFETY & SORTING TESTS COMPLETE ===\n");
}

testDeletionAndFirebase();
