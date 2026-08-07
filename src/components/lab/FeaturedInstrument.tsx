"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, Cpu, Play, RefreshCw, Zap } from "lucide-react";

export default function FeaturedInstrument() {
  const [inputText, setInputText] = useState("kasto chha sathi");
  const [isComputing, setIsComputing] = useState(false);

  // Mock transliteration dictionary & scores
  const samples: Record<string, { nepali: string; confidence: number; latency: number; tokens: number }> = {
    "kasto chha sathi": { nepali: "कस्तो छ साथी", confidence: 99.4, latency: 14, tokens: 3 },
    "namaste nepal": { nepali: "नमस्ते नेपाल", confidence: 99.8, latency: 11, tokens: 2 },
    "aayakar ain 2058": { nepali: "आयकर ऐन २०५८", confidence: 98.6, latency: 18, tokens: 4 },
  };

  const currentResult = samples[inputText.toLowerCase()] || {
    nepali: inputText.split(" ").map(w => w + " (रूपान्तरण)").join(" "),
    confidence: 96.2,
    latency: 22,
    tokens: inputText.split(" ").length,
  };

  const handleCompute = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
    }, 400);
  };

  return (
    <section className="w-full bg-[#16171A] text-[#F3F4F2] py-28 relative overflow-hidden">
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#C85A17_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#C85A17]">
              02 // Featured Instrument
            </span>
            <span className="h-[1px] w-12 bg-[#C85A17]/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 max-w-3xl">
            Romanized Nepali → Devanagari Neural Transliteration
          </h2>
          <p className="text-white/70 max-w-2xl text-base sm:text-lg mb-12 leading-relaxed">
            Sequence-to-sequence neural model fine-tuned on sub-word token alignments with real-time confidence scores and latency metrics.
          </p>
        </ScrollReveal>

        {/* Embedded Live Instrument */}
        <ScrollReveal delay={200}>
          <div className="bg-[#202226] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
            {/* Instrument Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 font-mono text-xs text-white/60">
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-[#C85A17]" />
                <span className="text-white font-semibold">MODEL: NEPAL-SEQ2SEQ-V3.4</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  ONLINE
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span>LATENCY: <strong className="text-white font-mono">{currentResult.latency}ms</strong></span>
                <span>CONFIDENCE: <strong className="text-emerald-400 font-mono">{currentResult.confidence}%</strong></span>
              </div>
            </div>

            {/* Input / Output Interactive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-wider text-white/50">
                  Romanized Nepali Input
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCompute()}
                    className="w-full bg-[#16171A] border border-white/15 rounded-xl px-4 py-3.5 text-white font-mono text-base focus:outline-none focus:border-[#C85A17] transition-colors"
                    placeholder="Type Romanized Nepali (e.g., namaste)..."
                  />
                  <button
                    onClick={handleCompute}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-[#C85A17] hover:bg-[#C85A17]/80 text-white rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isComputing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>RUN</span>
                  </button>
                </div>

                {/* Sample Shortcuts */}
                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <span className="text-white/40">Try:</span>
                  {Object.keys(samples).map((sampleKey) => (
                    <button
                      key={sampleKey}
                      onClick={() => {
                        setInputText(sampleKey);
                        handleCompute();
                      }}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                    >
                      "{sampleKey}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Structured Output Panel */}
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#C85A17]">
                  Devanagari Transliterated Result
                </label>
                <div className="w-full bg-[#16171A] border border-[#C85A17]/30 rounded-xl p-4 min-h-[110px] flex flex-col justify-between relative overflow-hidden">
                  {isComputing && (
                    <div className="absolute inset-0 bg-[#16171A]/80 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-full h-0.5 bg-[#C85A17] animate-scan" />
                    </div>
                  )}

                  <div className="text-2xl font-semibold text-white font-sans tracking-wide">
                    {currentResult.nepali}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-[11px] text-white/50">
                    <span>TOKEN COUNT: {currentResult.tokens}</span>
                    <span className="text-emerald-400">ALIGNMENT: HIGH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Readout Telemetry Strip */}
            <div className="bg-[#16171A] rounded-xl p-4 font-mono text-xs grid grid-cols-2 md:grid-cols-4 gap-4 border border-white/5">
              <div>
                <span className="text-white/40 block text-[10px]">SUB-WORD ATTENTION</span>
                <span className="text-white font-semibold">Self-Attn Layer 12</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">BEAM SIZE</span>
                <span className="text-white font-semibold">k = 5</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">TEMPERATURE</span>
                <span className="text-white font-semibold">0.2 (Deterministic)</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">VOCABULARIES</span>
                <span className="text-white font-semibold">32,000 Devanagari</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
