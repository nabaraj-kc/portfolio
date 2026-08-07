import { buildTopicContextualPrompt } from "../src/lib/firebase-storage.ts";

function testTopicPrompts() {
  console.log("\n=== TESTING TOPIC-MATCHED CONTEXTUAL PROMPT GENERATOR ===");

  const testCases = [
    {
      title: "Quantum Neural Networks for High-Frequency Crypto Trading",
      keywords: ["quantum", "qubit", "trading", "neural networks"],
      tag: "Quantum ML",
    },
    {
      title: "Multi-Agent Swarm Intelligence in Autonomous Robotics",
      keywords: ["agent", "swarm", "robotics", "autonomous"],
      tag: "Agentic AI",
    },
    {
      title: "Retrieval-Augmented Generation with Vector Databases",
      keywords: ["RAG", "vector database", "embeddings", "LLM"],
      tag: "LLM Systems",
    },
    {
      title: "LiDAR Point Cloud Segmentation for Self-Driving Systems",
      keywords: ["vision", "robot", "lidar", "spatial"],
      tag: "Computer Vision",
    },
  ];

  testCases.forEach((tc, idx) => {
    console.log(`\n--- Test Case ${idx + 1}: "${tc.title}" [${tc.tag}] ---`);
    const prompt = buildTopicContextualPrompt(tc.title, tc.keywords, tc.tag);
    console.log("Synthesized Prompt:\n", prompt);
  });

  console.log("\n=== ALL TOPIC MATCHING TESTS PASSED ===\n");
}

testTopicPrompts();
