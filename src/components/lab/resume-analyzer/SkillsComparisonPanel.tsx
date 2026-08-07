"use client";

import { Cpu, Plus } from "lucide-react";

interface SkillsComparisonPanelProps {
  extractedSkills: string[];
  missingSkills: string[];
}

export default function SkillsComparisonPanel({
  extractedSkills,
  missingSkills,
}: SkillsComparisonPanelProps) {
  return (
    <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-5 shadow-whisper space-y-4">
      <div className="flex items-center gap-2 border-b border-[#8F8F8F]/15 pb-3">
        <Cpu className="w-4 h-4 text-[#C85A17]" />
        <h3 className="font-sans text-base font-semibold text-[#1F2023]">
          Skills Comparison
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Skills */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold text-[#8A8F98] uppercase tracking-wider block">
            Extracted Skills ({extractedSkills.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {extractedSkills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-xs px-2.5 py-1 rounded bg-[#F3F4F2] text-[#1F2023] border border-[#8F8F8F]/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing / Consider Adding Skills */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold text-[#C85A17] uppercase tracking-wider block">
            Missing High-Value Keys ({missingSkills.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-xs px-2.5 py-1 rounded bg-[#C85A17]/5 text-[#C85A17] border border-[#C85A17]/30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
