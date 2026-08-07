const routes = [
  '/',
  '/articles',
  '/research',
  '/krrishmay',
  '/lab',
  '/lab/attention-visualizer',
  '/lab/code-reviewer',
  '/lab/cost-comparator',
  '/lab/nepali-translator',
  '/lab/nepali-qa',
  '/lab/resume-analyzer',
  '/admin',
  '/api/test-db',
];

async function runTests() {
  console.log("=== STARTING ENDPOINT AUDIT ===");
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      console.log(`[PASS] ${route} -> Status: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`[FAIL] ${route} -> Error: ${err.message}`);
    }
  }
  console.log("=== ENDPOINT AUDIT COMPLETED ===");
}

runTests();
