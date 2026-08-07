"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  label = "ATS SCORE",
  size = 220,
  strokeWidth = 14,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800; // 800ms ease-out per spec

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easeOutProgress = 1 - (1 - progress) * (1 - progress);
      setAnimatedScore(Math.round(easeOutProgress * score));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(138, 143, 152, 0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#C85A17"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-[stroke-dashoffset] duration-75 ease-out"
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-5xl sm:text-6xl font-bold text-[#1F2023] tracking-tight">
          {animatedScore}
          <span className="text-2xl font-normal text-[#8A8F98]">%</span>
        </span>
        <span className="font-mono text-xs text-[#8A8F98] uppercase tracking-widest mt-1 font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}
