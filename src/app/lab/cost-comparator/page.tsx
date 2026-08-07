"use client";

import { useState } from "react";
import LabNav from "@/components/lab/LabNav";
import FooterCTA from "@/components/FooterCTA";
import { ArrowLeft, ChevronDown, ChevronUp, Calculator, RefreshCw, DollarSign, Layers } from "lucide-react";
import Link from "next/link";

const MODELS = [
  { name: "GPT-4o (OpenAI)", inputPrice: 2.50, outputPrice: 10.00 },
  { name: "Claude 3.5 Sonnet (Anthropic)", inputPrice: 3.00, outputPrice: 15.00 },
  { name: "DeepSeek V3 (API)", inputPrice: 0.14, outputPrice: 0.28 },
  { name: "Llama 3 70B (Groq)", inputPrice: 0.59, outputPrice: 0.79 },
];

export default function CostComparatorPage() {
  const [promptTokens, setPromptTokens] = useState(2500);
  const [completionTokens, setCompletionTokens] = useState(800);
  const [requestVolume, setRequestVolume] = useState(10000);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <div className="min-h-screen lab-theme text-[#202020] flex flex-col font-sans">
      <LabNav />

      <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        {/* Back link */}
        <Link
          href="/lab"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lab</span>
        </Link>

        {/* Shared Tool Header */}
        <header className="mb-10 border-b border-[#8F8F8F]/20 pb-8">
          <div className="flex items-center gap-3 mb-3 font-mono text-xs">
            <span className="text-[#C85A17] uppercase tracking-wider font-semibold">Utility Tool</span>
            <span className="text-[#8F8F8F]">•</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/5 text-emerald-700 border border-emerald-600/20 uppercase font-semibold">
              Stable
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium text-[#202020] tracking-tight mb-3">
            LLM Cost &amp; Token Comparator
          </h1>

          <p className="text-base sm:text-lg text-[#202020]/80 max-w-3xl mb-4">
            Calculates prompt/completion costs and token density across leading frontier and open-source models.
          </p>

          {/* Technical "How it works" Collapsible */}
          <div className="bg-white border border-[#8F8F8F]/20 rounded-xl overflow-hidden max-w-3xl">
            <button
              onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
              className="w-full px-4 py-3 flex items-center justify-between font-mono text-xs text-[#202020]/75 hover:bg-[#F3F4F2] transition-colors"
            >
              <span>HOW IT WORKS &amp; ARCHITECTURE</span>
              {isHowItWorksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isHowItWorksOpen && (
              <div className="px-4 pb-4 pt-1 font-mono text-xs text-[#202020]/70 border-t border-[#8F8F8F]/15 leading-relaxed space-y-2">
                <p>
                  1. Computes client-side BPE token counts based on standard 1 token ≈ 4 characters ratio.
                </p>
                <p>
                  2. Applies published 1M token input/output pricing tiers dynamically without backend latency.
                </p>
              </div>
            )}
          </div>

          {/* Limitation Line */}
          <div className="mt-3 font-mono text-xs text-[#8F8F8F]">
            <strong>Limitation:</strong> Estimates rely on published API pricing schemas; actual latency depends on provider server load.
          </div>
        </header>

        {/* Template B Layout: Two Panel Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Input Parameters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F8F8F]/15 pb-3">
                <Calculator className="w-4 h-4 text-[#C85A17]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]">
                  Token &amp; Volume Parameters
                </h3>
              </div>

              {/* Slider 1: Input Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#202020]/80">Prompt Tokens (Input):</span>
                  <span className="font-semibold text-[#C85A17]">{promptTokens.toLocaleString()} tokens</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="50000"
                  step="100"
                  value={promptTokens}
                  onChange={(e) => setPromptTokens(Number(e.target.value))}
                  className="w-full accent-[#C85A17]"
                />
              </div>

              {/* Slider 2: Output Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#202020]/80">Completion Tokens (Output):</span>
                  <span className="font-semibold text-[#C85A17]">{completionTokens.toLocaleString()} tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={completionTokens}
                  onChange={(e) => setCompletionTokens(Number(e.target.value))}
                  className="w-full accent-[#C85A17]"
                />
              </div>

              {/* Slider 3: Monthly Volume */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#202020]/80">Monthly API Requests:</span>
                  <span className="font-semibold text-[#C85A17]">{requestVolume.toLocaleString()} requests</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={requestVolume}
                  onChange={(e) => setRequestVolume(Number(e.target.value))}
                  className="w-full accent-[#C85A17]"
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Structured Comparison Breakdown */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#8F8F8F]/15 pb-4">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]">
                  Structured Model Cost Projections
                </h3>
                <span className="font-mono text-[11px] text-[#8F8F8F]">PER MONTH</span>
              </div>

              <div className="space-y-3">
                {MODELS.map((m) => {
                  const inputCost = (promptTokens / 1_000_000) * m.inputPrice * requestVolume;
                  const outputCost = (completionTokens / 1_000_000) * m.outputPrice * requestVolume;
                  const totalCost = inputCost + outputCost;

                  return (
                    <div
                      key={m.name}
                      className="p-4 bg-[#F3F4F2] rounded-xl border border-[#8F8F8F]/15 flex items-center justify-between font-mono"
                    >
                      <div>
                        <strong className="text-sm font-sans text-[#202020] block">{m.name}</strong>
                        <span className="text-[11px] text-[#8F8F8F]">
                          ${m.inputPrice}/M in • ${m.outputPrice}/M out
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-[#202020] block">
                          ${totalCost.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#8F8F8F]">
                          ~${(totalCost / requestVolume).toFixed(4)} / request
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterCTA />
    </div>
  );
}
