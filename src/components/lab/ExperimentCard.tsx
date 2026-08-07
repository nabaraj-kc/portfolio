"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export interface Experiment {
  id: string;
  title: string;
  description: string;
  category: "Visualizer" | "Utility Tool" | "Nepali AI" | "Systems";
  maturity: "Stable" | "Experimental" | "New";
  previewType: "canvas" | "looping-pair" | "nepali-loop" | "token-graph";
  slug: string;
  isFeatured?: boolean;
}

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loopIndex, setLoopIndex] = useState(0);

  // Canvas animation for Visualizer preview
  useEffect(() => {
    if (experiment.previewType !== "canvas" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = 8;
      const rows = 5;
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const val = (Math.sin(time + i * 0.5 + j * 0.7) + 1) / 2;
          const alpha = 0.15 + val * 0.7;

          ctx.fillStyle = `rgba(200, 90, 23, ${alpha})`;
          ctx.beginPath();
          ctx.roundRect(
            i * cellW + 4,
            j * cellH + 4,
            cellW - 8,
            cellH - 8,
            3
          );
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [experiment.previewType]);

  // Cycle interval for looping previews
  useEffect(() => {
    if (experiment.previewType === "canvas") return;
    const interval = setInterval(() => {
      setLoopIndex((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, [experiment.previewType]);

  // Maturity badge styling helper
  const getBadgeStyle = (maturity: Experiment["maturity"]) => {
    switch (maturity) {
      case "Stable":
        return "bg-emerald-950/5 text-emerald-700 border-emerald-600/20";
      case "Experimental":
        return "bg-[#C85A17]/10 text-[#C85A17] border-[#C85A17]/25";
      case "New":
        return "bg-amber-950/5 text-amber-700 border-amber-600/20";
    }
  };

  return (
    <div
      className={`group relative bg-white border border-[#8F8F8F]/15 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#C85A17]/45 ${
        experiment.isFeatured ? "md:col-span-2 md:row-span-2 min-h-[420px]" : "min-h-[340px]"
      }`}
    >
      {/* Live Preview Header Zone */}
      <div className="relative w-full h-44 bg-[#16171A] p-4 flex flex-col justify-between overflow-hidden border-b border-[#8F8F8F]/15">
        {/* Top Metadata Strip */}
        <div className="flex items-center justify-between z-10">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
            {experiment.category}
          </span>
          <span
            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(
              experiment.maturity
            )}`}
          >
            {experiment.maturity}
          </span>
        </div>

        {/* Live Preview Render Area */}
        <div className="relative w-full h-full flex items-center justify-center my-2">
          {/* Preview Type 1: Canvas Visualizer */}
          {experiment.previewType === "canvas" && (
            <div className="w-full h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={260}
                height={100}
                className="w-full max-w-[280px] h-[90px] rounded object-contain"
              />
            </div>
          )}

          {/* Preview Type 2: Looping Pair (Utility Tools) */}
          {experiment.previewType === "looping-pair" && (
            <div className="w-full font-mono text-xs space-y-2 px-2">
              <div className="bg-white/5 p-2 rounded border border-white/10 text-white/70 flex items-center justify-between">
                <span className="truncate max-w-[180px]">
                  {loopIndex === 0 && "Input: senior_engineer_cv.pdf"}
                  {loopIndex === 1 && "Input: fn reviewCode(ast) {...}"}
                  {loopIndex === 2 && "Input: prompt_tokens = 14,200"}
                </span>
                <span className="text-[#C85A17] font-semibold">RAW</span>
              </div>
              <div className="bg-white/10 p-2 rounded border border-[#C85A17]/30 text-white flex items-center justify-between animate-in fade-in duration-300">
                <span className="truncate max-w-[200px]">
                  {loopIndex === 0 && "Match Score: 94% • High Impact"}
                  {loopIndex === 1 && "2 Security Warnings • Refactor ready"}
                  {loopIndex === 2 && "Est. Cost: $0.0028 / request"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          )}

          {/* Preview Type 3: Nepali Transliteration Loop */}
          {experiment.previewType === "nepali-loop" && (
            <div className="w-full flex items-center justify-around font-mono text-sm px-4">
              <div className="text-white/60 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                {loopIndex === 0 && "namaste"}
                {loopIndex === 1 && "nepal_tax_2058"}
                {loopIndex === 2 && "dhanyabad"}
              </div>
              <ArrowRight className="w-4 h-4 text-[#C85A17]" />
              <div className="text-white bg-[#C85A17]/20 border border-[#C85A17]/40 px-3 py-1.5 rounded font-sans text-base font-semibold">
                {loopIndex === 0 && "नमस्ते"}
                {loopIndex === 1 && "आयकर ऐन २०५८"}
                {loopIndex === 2 && "धन्यवाद"}
              </div>
            </div>
          )}

          {/* Preview Type 4: Token Graph */}
          {experiment.previewType === "token-graph" && (
            <div className="w-full space-y-1.5 font-mono text-[11px] px-3">
              <div className="flex items-center gap-2">
                <span className="w-16 text-white/60">GPT-4o</span>
                <div className="flex-1 bg-white/10 h-2 rounded overflow-hidden">
                  <div className="bg-[#C85A17] h-full w-[85%] transition-all duration-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-white/60">Sonnet 3.5</span>
                <div className="flex-1 bg-white/10 h-2 rounded overflow-hidden">
                  <div className="bg-amber-500 h-full w-[60%] transition-all duration-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-white/60">Llama 3</span>
                <div className="flex-1 bg-white/10 h-2 rounded overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[30%] transition-all duration-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom subtle scanning status */}
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
          <span>LIVE PREVIEW</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ACTIVE
          </span>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-6 flex flex-col justify-between flex-grow space-y-4 bg-white">
        <div>
          <h3 className="text-xl font-medium text-[#202020] group-hover:text-[#C85A17] transition-colors mb-2">
            {experiment.title}
          </h3>
          <p className="text-sm text-[#202020]/75 leading-relaxed">
            {experiment.description}
          </p>
        </div>

        <Link
          href={experiment.slug}
          className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-[#202020] group-hover:text-[#C85A17] transition-colors pt-2 uppercase tracking-wider"
        >
          <span>Try experiment</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
