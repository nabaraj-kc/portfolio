"use client";

import { Check, AlertCircle, LayoutList } from "lucide-react";

export interface FeedbackItem {
  id: string;
  type: "pass" | "suggestion";
  text: string;
}

interface FormattingFeedbackListProps {
  items: FeedbackItem[];
}

export default function FormattingFeedbackList({ items }: FormattingFeedbackListProps) {
  return (
    <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-5 shadow-whisper space-y-4">
      <div className="flex items-center gap-2 border-b border-[#8F8F8F]/15 pb-3">
        <LayoutList className="w-4 h-4 text-[#C85A17]" />
        <h3 className="font-sans text-base font-semibold text-[#1F2023]">
          Formatting &amp; Structure Feedback
        </h3>
      </div>

      <div className="divide-y divide-[#8F8F8F]/15">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0 bg-transparent">
            {item.type === "pass" ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-3 h-3 text-amber-600" />
              </div>
            )}
            <span className="text-xs sm:text-sm text-[#1F2023]/90 font-sans leading-relaxed">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
