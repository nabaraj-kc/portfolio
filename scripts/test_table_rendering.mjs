import fs from "fs";
import path from "path";

function testTablePaper() {
  const filePath = path.join(process.cwd(), "data", "research.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const newPaper = {
    _id: "test-table-paper-101",
    slug: "ai-enterprise-adoption-benchmark-2026",
    title: "AI Enterprise Adoption Benchmark 2026",
    abstract: "This paper evaluates global industry adoption metrics across technology, healthcare, finance, and manufacturing sectors.",
    excerpt: "Comprehensive 2026 benchmark metrics on AI enterprise adoption across major industry sectors.",
    tag: "Enterprise AI",
    keywords: ["AI", "Enterprise", "Benchmark", "Adoption"],
    date: "8/4/2026",
    readTime: "5 min read",
    author: "Nabaraj KC",
    content: `## Abstract

McKinsey's 2026 analysis reveals distinct adoption patterns across industries.

## 1. Introduction

As artificial intelligence matures, enterprise integration levels are accelerating across all primary economic sectors.

## 2. Industry-Specific Adoption Patterns

McKinsey's 2026 analysis reveals distinct adoption patterns across industries:

| Industry Sector | AI Integration Level (2030) | Primary Use Cases |
| :--- | :---: | :--- |
| **Technology** | 95% | Product development, customer service automation |
| **Financial Services** | 88% | Fraud detection, risk assessment, algorithmic trading |
| **Healthcare** | 85% | Diagnostic imaging, drug discovery, personalized medicine |
| **Manufacturing** | 82% | Predictive maintenance, quality control, supply chain optimization |
| **Retail / E-commerce** | 79% | Personalization, inventory management, dynamic pricing |
| **Professional Services** | 75% | Document analysis, legal research, consulting augmentation |

## 3. Key Insights & Takeaways

> "The bottleneck is no longer algorithm efficiency, but organizational adaptation and data governance maturity."

---

## 4. Conclusion

Organizations prioritizing early AI architecture modernization demonstrate 3.4x higher operational efficiency growth.

## References

1. McKinsey Global AI Survey 2026.
2. Stanford HAI Index Report 2026.
`,
    wordCount: 1200,
    generatedBy: "on-demand-ai",
    publishedAt: new Date().toISOString()
  };

  if (Array.isArray(data.papers)) {
    // Unshift or replace if test paper exists
    const idx = data.papers.findIndex(p => p.slug === newPaper.slug);
    if (idx !== -1) {
      data.papers[idx] = newPaper;
    } else {
      data.papers.unshift(newPaper);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("✅ Seeded test paper with GFM Table!");
}

testTablePaper();
