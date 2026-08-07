async function testAPIs() {
  console.log("\n=== STARTING API & BUSINESS LOGIC TEST SUITE ===");

  // 1. Test DB Connection
  try {
    const res = await fetch("http://localhost:3000/api/test-db");
    const json = await res.json();
    console.log(`[API TEST] /api/test-db: ${res.status}`, json);
  } catch (err) {
    console.error("[API TEST] /api/test-db ERROR:", err.message);
  }

  // 2. Test Admin Login (Invalid Password)
  try {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong-password" }),
    });
    const json = await res.json();
    console.log(`[API TEST] /api/admin/login (Invalid Password): Status ${res.status}`, json);
  } catch (err) {
    console.error("[API TEST] /api/admin/login Invalid Password ERROR:", err.message);
  }

  // 3. Test Admin Login (Valid Password)
  try {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "nabarajkc@admin" }),
    });
    const json = await res.json();
    console.log(`[API TEST] /api/admin/login (Valid Password): Status ${res.status}`, json);
  } catch (err) {
    console.error("[API TEST] /api/admin/login Valid Password ERROR:", err.message);
  }

  // 4. Test Contact Form Validation (Missing Email)
  try {
    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "QA Tester", message: "Test Message" }),
    });
    const json = await res.json();
    console.log(`[API TEST] /api/contact (Missing email): Status ${res.status}`, json);
  } catch (err) {
    console.error("[API TEST] /api/contact Missing email ERROR:", err.message);
  }

  // 5. Test Tool Assistant API (Nepali Translator tool call)
  try {
    const res = await fetch("http://localhost:3000/api/lab/tool-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolName: "Nepali Translator",
        skipThinking: true,
        messages: [{ role: "user", content: "Translate 'Hello' to Nepali" }],
      }),
    });
    console.log(`[API TEST] /api/lab/tool-assistant: Status ${res.status}`);
  } catch (err) {
    console.error("[API TEST] /api/lab/tool-assistant ERROR:", err.message);
  }

  // 6. Test Chat API
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello Krrishmay! Who are you?" }],
      }),
    });
    const json = await res.json();
    console.log(`[API TEST] /api/chat: Status ${res.status}`, json?.reply?.slice(0, 100) || json);
  } catch (err) {
    console.error("[API TEST] /api/chat ERROR:", err.message);
  }

  console.log("=== API & BUSINESS LOGIC TEST SUITE COMPLETED ===\n");
}

testAPIs();
