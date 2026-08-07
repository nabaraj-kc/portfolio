"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import ExperimentCard, { Experiment } from "./ExperimentCard";

const FLAGSHIP_EXPERIMENTS: Experiment[] = [
  {
    id: "exp-1",
    title: "Attention-Head Visualizer",
    description: "Interactive real-time visualization of multi-head self-attention weights and query-key matrix dot products.",
    category: "Visualizer",
    maturity: "Stable",
    previewType: "canvas",
    slug: "/lab/attention-visualizer",
    isFeatured: true,
  },
  {
    id: "exp-2",
    title: "Resume / CV Analyzer",
    description: "Scores resumes against job descriptions with multi-pass structured section extraction and skill density gap reports.",
    category: "Utility Tool",
    maturity: "Stable",
    previewType: "looping-pair",
    slug: "/lab/resume-analyzer",
  },
  {
    id: "exp-3",
    title: "AI Code Reviewer",
    description: "Automated AST static analysis and LLM security audits with line-level diff recommendations.",
    category: "Utility Tool",
    maturity: "Experimental",
    previewType: "looping-pair",
    slug: "/lab/code-reviewer",
  },
  {
    id: "exp-4",
    title: "Nepali Document & Tax Q&A",
    description: "Retrieval-Augmented Generation (RAG) assistant grounded strictly in Nepal's Income Tax Act 2058 with verbatim clause citations.",
    category: "Nepali AI",
    maturity: "New",
    previewType: "nepali-loop",
    slug: "/lab/nepali-qa",
  },
  {
    id: "exp-5",
    title: "LLM Cost & Token Comparator",
    description: "Client-side cost model and token length comparator across OpenAI, Anthropic, and open-source models.",
    category: "Utility Tool",
    maturity: "Stable",
    previewType: "token-graph",
    slug: "/lab/cost-comparator",
  },
];

const CATEGORIES = ["All", "Visualizer", "Utility Tool", "Nepali AI", "Systems"] as const;

export default function ExperimentGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredExperiments =
    activeCategory === "All"
      ? FLAGSHIP_EXPERIMENTS
      : FLAGSHIP_EXPERIMENTS.filter((exp) => exp.category === activeCategory);

  return (
    <section id="experiments" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
      {/* Section Header & Category Filter Tabs */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#8F8F8F]/20 pb-6">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F] block mb-2">
              01 // Live Prototypes
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#202020] tracking-tight">
              Experiment Directory
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono text-xs px-3.5 py-1.5 rounded-full transition-colors border ${
                  activeCategory === cat
                    ? "bg-[#16171A] text-[#F3F4F2] border-[#16171A]"
                    : "bg-white text-[#202020]/80 border-[#8F8F8F]/20 hover:border-[#C85A17]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((experiment, idx) => (
          <ScrollReveal key={experiment.id} delay={idx * 100}>
            <ExperimentCard experiment={experiment} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
