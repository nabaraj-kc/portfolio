"use client";

import { Tag } from "lucide-react";

interface KeywordMatchCardProps {
  matchPercentage: number;
  description?: string;
}

export default function KeywordMatchCard({
  matchPercentage,
  description = "Industry-relevant terms & targeted role skill density",
}: KeywordMatchCardProps) {
  return (
    <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-5 shadow-whisper space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#C85A17]" />
          <h3 className="font-sans text-base font-semibold text-[#1F2023]">
            Keyword Match
          </h3>
        </div>
        <span className="font-mono text-sm font-bold text-[#C85A17]">
          {matchPercentage}%
        </span>
      </div>

      <p className="text-xs text-[#8A8F98] leading-relaxed">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-[#F3F4F2] h-2 rounded-full overflow-hidden border border-[#8F8F8F]/15">
        <div
          className="bg-[#C85A17] h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${matchPercentage}%` }}
        />
      </div>
    </div>
  );
}
