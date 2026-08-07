"use client";

import { useState } from "react";
import { BookOpen, Send, Loader2, BookMarked, ExternalLink } from "lucide-react";
import LabDashboardLayout from "@/components/lab/LabDashboardLayout";
import LabChatPanel from "@/components/lab/LabChatPanel";
import Link from "next/link";

const PRESET_QUESTIONS = [
  { text: "नेपालको राजधानी कहाँ छ?", lang: "Devanagari" },
  { text: "What is the Dashain festival?", lang: "English" },
  { text: "Mount Everest ko unchai kati ho?", lang: "Roman Nepali" },
  { text: "नेपालमा कति जिल्ला छन्?", lang: "Devanagari" },
  { text: "Nepali language ma hello kasari bhancha?", lang: "Roman Nepali" },
  { text: "What currency does Nepal use?", lang: "English" },
];

const TOPICS = [
  { label: "Geography", examples: ["Provinces of Nepal", "Himalayan peaks", "Rivers and lakes"] },
  { label: "Culture", examples: ["Dashain & Tihar", "Newari culture", "Nepali food"] },
  { label: "Language", examples: ["Nepali grammar", "Roman ↔ Devanagari", "Dialect variations"] },
  { label: "History", examples: ["Prithvi Narayan Shah", "2015 earthquake", "Federal republic"] },
];

export default function NepaliQAPage() {
  const [topic, setTopic] = useState<string | null>(null);

  return (
    <LabDashboardLayout title="Nepali Q&A">
      <div className="p-8 max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Nepali Q&A Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Beta</span>
            </div>
            <p className="text-[12px] text-[#9B9B98] max-w-xl leading-relaxed">
              Ask anything in Nepali (Devanagari or Roman) or about Nepal. Geography, culture, language, history — I know it all.
              Answers stream token by token in real time.
            </p>
          </div>
          <Link href="/lab/nepali-qa/docs" className="shrink-0 flex items-center gap-1.5 text-[12px] font-medium text-[#5C5C5A] hover:text-[#1A1A1A] transition-colors">
            <BookMarked className="w-3.5 h-3.5" /> Docs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Topics + Examples */}
          <div className="col-span-1 lg:col-span-4 space-y-5">

            {/* Topic Filter */}
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Browse Topics</h3>
              <div className="space-y-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setTopic(topic === t.label ? null : t.label)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${
                      topic === t.label
                        ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        : "border-[#E8E8E6] hover:border-[#1A1A1A]/30 text-[#5C5C5A]"
                    }`}
                  >
                    <p className="text-[13px] font-medium">{t.label}</p>
                    {topic === t.label && (
                      <ul className="mt-2 space-y-1">
                        {t.examples.map((ex, i) => (
                          <li key={i} className="text-[11px] text-white/70 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Questions */}
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-3">
              <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Example Questions</h3>
              <div className="space-y-2">
                {PRESET_QUESTIONS.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F7F7F6] border border-[#E8E8E6] hover:border-amber-300 hover:bg-amber-50/40 transition-all cursor-pointer">
                    <p className="text-[12px] font-medium text-[#1A1A1A] leading-relaxed">"{q.text}"</p>
                    <p className="text-[10px] text-[#9B9B98] mt-1 font-mono">{q.lang}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Main Chat */}
          <div className="col-span-1 lg:col-span-8">
            <LabChatPanel
              toolName="Nepali Q&A"
              currentToolState={{ activeTopic: topic }}
              className="h-[680px]"
              initialMessage={`नमस्ते! I'm your Nepali Q&A assistant. Ask me anything in Nepali (देवनागरी or Roman) or about Nepal. I can answer questions about geography, culture, language, history, festivals, and more.\n\nTry asking: "नेपालको राजधानी कहाँ छ?" or "What is Dashain?"`}
            />
          </div>

        </div>

      </div>
    </LabDashboardLayout>
  );
}
