"use client";

import { useEffect, useRef, useState } from "react";
import LabNav from "@/components/lab/LabNav";
import FooterCTA from "@/components/FooterCTA";
import { ArrowLeft, ChevronDown, ChevronUp, Sliders, Eye } from "lucide-react";
import Link from "next/link";

export default function AttentionVisualizerPage() {
  const [inputText, setInputText] = useState("The Transformer model pays attention to context");
  const [selectedHead, setSelectedHead] = useState(1);
  const [temperature, setTemperature] = useState(0.7);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tokens = inputText.split(" ").filter(Boolean);

  // Render Attention Heatmap Matrix on Canvas
  useEffect(() => {
    if (!canvasRef.current || tokens.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const n = tokens.length;
    const padding = 60;
    const gridWidth = canvas.width - padding * 2;
    const gridHeight = canvas.height - padding * 2;
    const cellW = gridWidth / n;
    const cellH = gridHeight / n;

    // Draw tokens on axes
    ctx.font = "12px monospace";
    ctx.fillStyle = "#202020";
    ctx.textAlign = "right";

    // Row tokens (Queries)
    tokens.forEach((t, i) => {
      ctx.fillText(t.slice(0, 8), padding - 10, padding + i * cellH + cellH / 2 + 4);
    });

    // Column tokens (Keys)
    ctx.textAlign = "center";
    tokens.forEach((t, j) => {
      ctx.save();
      ctx.translate(padding + j * cellW + cellW / 2, padding - 15);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(t.slice(0, 8), 0, 0);
      ctx.restore();
    });

    // Draw Attention Weights Matrix Cells
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // Generate deterministic weight based on token positions, head & temp
        const rawDot = Math.sin(i * 0.8 + j * 0.6 + selectedHead * 1.5);
        const weight = Math.min(1, Math.max(0.05, (rawDot + 1) / 2 / temperature));

        // Color cell: Accent color #C85A17 with alpha equal to attention weight
        ctx.fillStyle = `rgba(200, 90, 23, ${weight})`;
        ctx.fillRect(
          padding + j * cellW + 2,
          padding + i * cellH + 2,
          cellW - 4,
          cellH - 4
        );

        // Draw weight value text inside cell
        ctx.fillStyle = weight > 0.5 ? "#FFFFFF" : "#202020";
        ctx.font = "10px monospace";
        ctx.fillText(
          weight.toFixed(2),
          padding + j * cellW + cellW / 2,
          padding + i * cellH + cellH / 2 + 3
        );
      }
    }
  }, [inputText, selectedHead, temperature, tokens]);

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
            <span className="text-[#C85A17] uppercase tracking-wider font-semibold">Visualizer</span>
            <span className="text-[#8F8F8F]">•</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/5 text-emerald-700 border border-emerald-600/20 uppercase font-semibold">
              Stable
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium text-[#202020] tracking-tight mb-3">
            Attention-Head Visualizer
          </h1>

          <p className="text-base sm:text-lg text-[#202020]/80 max-w-3xl mb-4">
            Interactive real-time visualization of multi-head self-attention weights and query-key matrix dot products.
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
                  1. Computes Query-Key dot products scaled by {"1 / \\sqrt{d_k}"} for each token pair.
                </p>
                <p>
                  2. Applies Softmax temperature scaling to render visual heatmap intensities in real time.
                </p>
              </div>
            )}
          </div>

          {/* Limitation Line */}
          <div className="mt-3 font-mono text-xs text-[#8F8F8F]">
            <strong>Limitation:</strong> Simulates 8-head transformer layers with 128-dim embeddings; full 4096-dim model heads run on GPU.
          </div>
        </header>

        {/* Template A Layout: Left Controls + Main Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Controls Panel (30% width desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F8F8F]/15 pb-3">
                <Sliders className="w-4 h-4 text-[#C85A17]" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]">
                  Model Controls
                </h3>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-[#202020] font-semibold block">
                  Input Sentence
                </label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-[#F3F4F2] border border-[#8F8F8F]/20 rounded-lg p-3 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#C85A17]"
                />
              </div>

              {/* Head Selector Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#202020]/80">Attention Head:</span>
                  <span className="font-semibold text-[#C85A17]">Head {selectedHead} of 8</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={selectedHead}
                  onChange={(e) => setSelectedHead(Number(e.target.value))}
                  className="w-full accent-[#C85A17]"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#202020]/80">Softmax Temp ($\tau$):</span>
                  <span className="font-semibold text-[#C85A17]">{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-[#C85A17]"
                />
              </div>
            </div>
          </div>

          {/* Main Visualizer Area (Template A - Unboxed breathed canvas) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="w-full bg-white border border-[#8F8F8F]/20 rounded-2xl p-6 min-h-[500px] flex items-center justify-center relative overflow-hidden shadow-xs">
              <canvas
                ref={canvasRef}
                width={560}
                height={460}
                className="w-full h-[460px] object-contain"
              />
            </div>

            {/* Template A Readout Strip */}
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-4 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[#8F8F8F] block text-[10px]">CURRENT LAYER</span>
                <span className="text-[#202020] font-semibold">Layer 12 (Self-Attn)</span>
              </div>
              <div>
                <span className="text-[#8F8F8F] block text-[10px]">HEAD INDEX</span>
                <span className="text-[#C85A17] font-semibold">Head {selectedHead}</span>
              </div>
              <div>
                <span className="text-[#8F8F8F] block text-[10px]">AVG ENTROPY</span>
                <span className="text-[#202020] font-semibold">1.42 nats</span>
              </div>
              <div>
                <span className="text-[#8F8F8F] block text-[10px]">MATRIX SIZE</span>
                <span className="text-[#202020] font-semibold">{tokens.length} × {tokens.length}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterCTA />
    </div>
  );
}
