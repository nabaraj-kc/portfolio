/**
 * RAG Engine — Tavily-powered Research and Retrieval for Autonomous Content Generation
 *
 * Upgraded to target authoritative sources:
 * - MIT, Stanford, Carnegie Mellon, Oxford, DeepMind, Google Brain
 * - ArXiv, IEEE, Nature, Science Direct preprints
 * - Major tech news channels: TechCrunch, Wired, Ars Technica, VentureBeat, The Verge
 * - Real university experiments, benchmarks, and lab announcements
 */

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

// === Domain pools ===

/** Research/academic topic queries — targets university labs and arxiv preprints */
const RESEARCH_TOPICS = [
  "MIT CSAIL AI research 2025 2026",
  "Stanford HAI artificial intelligence breakthroughs 2025",
  "DeepMind latest AI research publication 2025 2026",
  "Carnegie Mellon CMU AI robotics research 2025",
  "UC Berkeley AI systems research 2025 2026",
  "Oxford Future of Humanity Institute AI safety 2025",
  "Google Brain AI research paper 2025 2026",
  "arxiv AI machine learning research preprint 2025 2026",
  "IEEE AI breakthrough paper 2025",
  "Nature machine intelligence research 2025 2026",
  "large language model new architecture research university 2025",
  "multi-agent AI systems academic paper 2025 2026",
  "transformer architecture improvements research 2025",
  "reinforcement learning from human feedback RLHF latest paper",
  "AI hardware neural processing unit chip 2025 2026",
  "quantum AI computing research university experiment 2025",
  "computer vision foundation model research 2025 2026",
  "robotics dexterous manipulation AI research MIT 2025",
  "diffusion model improvements research paper 2026",
  "AI alignment safety research academic 2025 2026",
];

/** Tech news topic queries — targets major news channels and industry blogs */
const NEWS_TOPICS = [
  "latest AI news TechCrunch 2025 2026",
  "AI machine learning Wired news 2025",
  "artificial intelligence Ars Technica technology news 2025",
  "AI startup breakthrough VentureBeat 2025 2026",
  "OpenAI Anthropic Google AI model release 2025 2026",
  "AI chip semiconductor industry news 2025",
  "autonomous AI agent deployment news 2025 2026",
  "AI regulation policy news 2025",
  "edge AI on-device machine learning news 2025 2026",
  "AI in healthcare medicine clinical trial 2025",
  "generative AI enterprise adoption news 2025 2026",
  "new LLM model release benchmark comparison 2025",
];

async function tavilySearch(
  query: string,
  maxResults: number = 8,
  includeDomains: string[] = []
): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[RAG] No TAVILY_API_KEY");
    return [];
  }

  try {
    const body: Record<string, any> = {
      query,
      search_depth: "advanced",
      include_answer: true,
      include_raw_content: false,
      max_results: maxResults,
    };

    // Optionally restrict search to authoritative domains
    if (includeDomains.length > 0) {
      body.include_domains = includeDomains;
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("[RAG] Tavily error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.content || "",
      score: r.score || 0,
      publishedDate: r.published_date,
    }));
  } catch (err) {
    console.error("[RAG] Tavily error:", err);
    return [];
  }
}

/**
 * Discovers a fresh trending topic that is not similar to existing content.
 * Searches across a mix of research and news topics to maximize variety.
 */
export async function discoverTrendingTopic(
  existingTitles: string[],
  target: "article" | "research" = "article"
): Promise<{
  topic: string;
  context: string;
  sources: TavilyResult[];
}> {
  let queries: string[] = [];

  if (target === "research") {
    queries = [...RESEARCH_TOPICS].sort(() => Math.random() - 0.5).slice(0, 4);
  } else {
    const shuffledNews = [...NEWS_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);
    const shuffledResearch = [...RESEARCH_TOPICS].sort(() => Math.random() - 0.5).slice(0, 1);
    queries = [...shuffledNews, ...shuffledResearch];
  }

  const allBatches: Array<{ query: string; results: TavilyResult[] }> = [];

  // Run in parallel for speed
  const batchResults = await Promise.allSettled(
    queries.map((q) => tavilySearch(q, 5))
  );

  for (let i = 0; i < queries.length; i++) {
    const result = batchResults[i];
    if (result.status === "fulfilled" && result.value.length > 0) {
      allBatches.push({ query: queries[i], results: result.value });
    }
  }

  if (allBatches.length === 0) {
    const existingLower = (existingTitles || []).filter(Boolean).map((t) => String(t).toLowerCase());

    const DYNAMIC_RESEARCH_SEEDS = [
      "Sub-Network Entropy & Zero-Knowledge Proof Compression in Distributed Systems",
      "Asymmetric Entanglement Dynamics in Superconducting Qubit Arrays",
      "Neuromorphic Event-Based Sensing & Micro-Latency Perception Matrices",
      "Hierarchical Vector Embedding Distillation for Multi-Modal LLMs",
      "Autonomous Multi-Agent Consensus Mechanisms in High-Throughput DAGs",
      "Self-Optimizing Compiler Targets for Edge WebAssembly Runtimes",
      "Sparse Mixture-of-Experts Router Bottlenecks in Sub-Billion Parameter Models",
      "Distributed Spatial Perception Graphs for Heterogeneous Drone Swarms",
      "Memory-Safe Rust Kernel Interoperability in Low-Resource Microcontrollers",
      "Post-Quantum Lattice-Based Cryptographic Primitives in Mesh Networks",
    ];

    const DYNAMIC_ARTICLE_SEEDS = [
      "Architecting Production-Ready Multi-Agent Workflows in 2026",
      "Why Vector Databases are Moving Beyond HNSW Indexing",
      "Building Zero-Trust Edge API Gateways with WebAssembly Runtimes",
      "Designing Low-Latency Reasoning Pipelines with DeepSeek R1 and Gemini Flash",
      "How Modern Distributed Systems Handle Split-Brain Consensus Without Raft",
      "Optimizing Context Window Caching for Multi-Turn Agent Applications",
      "The Shift from Monolithic LLM Fine-Tuning to Dynamic LoRA Adapter Networks",
      "Building Self-Healing Microservices with Autonomous AI Diagnostic Agents",
      "How Graph Neural Networks are Revolutionizing Real-Time Fraud Detection",
      "Modern Web Architecture: Combining Next.js Server Components with Edge Workers",
    ];

    const seedPool = target === "research" ? DYNAMIC_RESEARCH_SEEDS : DYNAMIC_ARTICLE_SEEDS;
    
    // Pick a topic seed that is NOT in existingTitles
    let selectedTopic = seedPool[Math.floor(Math.random() * seedPool.length)];
    for (const seed of seedPool) {
      const isUsed = existingLower.some((e) => e.includes(seed.toLowerCase().slice(0, 15)));
      if (!isUsed) {
        selectedTopic = seed;
        break;
      }
    }

    if (existingLower.some((e) => e.includes(selectedTopic.toLowerCase().slice(0, 15)))) {
      selectedTopic = `${selectedTopic} (${Date.now().toString().slice(-4)})`;
    }

    return {
      topic: selectedTopic,
      context: `Comprehensive analysis and implementation guidelines regarding ${selectedTopic}.`,
      sources: [],
    };
  }

  // Score by average Tavily relevance score
  let bestBatch = allBatches[0];
  let bestScore = 0;
  for (const batch of allBatches) {
    const avg =
      batch.results.reduce((s: number, r: TavilyResult) => s + r.score, 0) /
      batch.results.length;
    if (avg > bestScore) {
      bestScore = avg;
      bestBatch = batch;
    }
  }

  // Deduplication — skip topics too similar to existing content
  const existingLower = (existingTitles || []).filter(Boolean).map((t) => String(t).toLowerCase());
  let chosenBatch = bestBatch;
  for (const batch of allBatches) {
    const topTitle = (batch.results[0]?.title || "").toLowerCase();
    const words = topTitle.split(" ").filter((w: string) => w.length > 5);
    const tooSimilar = existingLower.some((e) =>
      words.some((w: string) => e && e.includes(w))
    );
    if (!tooSimilar) {
      chosenBatch = batch;
      break;
    }
  }

  let topic =
    chosenBatch.results[0]?.title ||
    chosenBatch.query.replace(/\d{4}/g, "").trim();

  // Enforce strict uniqueness on final derived topic name
  if (existingLower.some((e) => e.includes(topic.toLowerCase().slice(0, 20)))) {
    topic = `${topic} — Novel Perspective (${new Date().getFullYear()})`;
  }

  const context = chosenBatch.results
    .slice(0, 6)
    .map(
      (r: TavilyResult, i: number) =>
        `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\nPublished: ${r.publishedDate || "recent"}\n${r.content}`
    )
    .join("\n\n---\n\n");

  return { topic, context, sources: chosenBatch.results };
}

/** Authoritative domains for deep research — arxiv, university labs, top-tier news */
const AUTHORITATIVE_DOMAINS = [
  "arxiv.org",
  "mit.edu",
  "stanford.edu",
  "cmu.edu",
  "deepmind.com",
  "ai.google",
  "research.google",
  "openai.com",
  "anthropic.com",
  "nature.com",
  "ieee.org",
  "techcrunch.com",
  "wired.com",
  "arstechnica.com",
  "venturebeat.com",
  "theverge.com",
];

/**
 * Deep-researches a discovered topic against academic + news sources.
 * Returns rich context text plus ranked sources for citations.
 */
export async function deepResearchTopic(topic: string): Promise<{
  context: string;
  sources: TavilyResult[];
}> {
  const [academicResults, newsResults, universityResults] = await Promise.all([
    tavilySearch(
      `${topic} research paper technical academic`,
      8,
      ["arxiv.org", "nature.com", "ieee.org", "mit.edu", "stanford.edu", "deepmind.com"]
    ),
    tavilySearch(
      `${topic} latest developments news 2025 2026`,
      5,
      ["techcrunch.com", "wired.com", "arstechnica.com", "venturebeat.com", "theverge.com"]
    ),
    tavilySearch(
      `${topic} university experiment lab result 2025 2026`,
      5,
      ["mit.edu", "stanford.edu", "cmu.edu", "ox.ac.uk", "berkeley.edu"]
    ),
  ]);

  // Merge + deduplicate by URL + rank by score
  const seen = new Set<string>();
  const allResults: TavilyResult[] = [];
  for (const r of [...academicResults, ...universityResults, ...newsResults]) {
    if (!seen.has(r.url)) {
      seen.add(r.url);
      allResults.push(r);
    }
  }
  allResults.sort((a, b) => b.score - a.score);
  const top = allResults.slice(0, 12);

  const context = top
    .map(
      (r: TavilyResult, i: number) =>
        `[Research Source ${i + 1}]\nTitle: ${r.title}\nURL: ${r.url}\nPublished: ${r.publishedDate || "recent"}\nContent: ${r.content}`
    )
    .join("\n\n---\n\n");

  return { context, sources: top };
}
