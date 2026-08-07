async function testGenerateContent() {
  console.log("\n=== TESTING CHATBOT GENERATE CONTENT API ROUTE ===");

  try {
    const res = await fetch("http://localhost:3000/api/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "research",
        topic: "AGI",
        requestedBy: "admin-command-test",
      }),
    });

    const data = await res.json();
    console.log(`[TEST] Status: ${res.status}`);
    console.log("[TEST] Response Data:", data);

    if (data.success) {
      console.log("\n✅ SUCCESS: Research Paper generated & saved!");
      console.log("Title:", data.title);
      console.log("Slug:", data.slug);
      console.log("URL:", data.url);
      console.log("Word Count:", data.wordCount);
    } else {
      console.error("\n❌ ERROR:", data.error);
    }
  } catch (err) {
    console.error("\n❌ Network error:", err.message);
  }

  console.log("\n=== TEST COMPLETE ===\n");
}

testGenerateContent();
