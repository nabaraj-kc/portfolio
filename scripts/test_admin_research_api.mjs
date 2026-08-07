async function testAdminResearchAPI() {
  console.log("\n=== TESTING GET /api/admin/research ENDPOINT ===");

  try {
    const res = await fetch("http://localhost:3000/api/admin/research", {
      headers: { Cookie: "admin_session=nkc-admin-secret-2026" },
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Returned Keys:", Object.keys(data));
    console.log("Papers Count:", data.papers?.length);
    if (data.papers && data.papers.length > 0) {
      console.log("Sample Paper 1:", {
        id: data.papers[0].id,
        slug: data.papers[0].slug,
        title: data.papers[0].title,
        generatedBy: data.papers[0].generatedBy,
      });
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }

  console.log("\n=== TEST COMPLETE ===\n");
}

testAdminResearchAPI();
