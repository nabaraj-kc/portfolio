"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Copy, Check, Trash2, Volume2, Loader2, Sparkles } from "lucide-react";
import LabDashboardLayout from "@/components/lab/LabDashboardLayout";
import LabChatPanel from "@/components/lab/LabChatPanel";

type Lang = "nepali" | "roman" | "english";

const langLabels: Record<Lang, string> = {
  nepali: "Nepali (देवनागरी)",
  roman: "Roman Nepali",
  english: "English",
};

const langExamples: Record<Lang, string> = {
  nepali: "नमस्ते, तपाईंलाई कस्तो छ?",
  roman: "Namaste, tapailai kasto cha?",
  english: "Hello, how are you?",
};

export default function NepaliTranslatorPage() {
  const [from, setFrom] = useState<Lang>("roman");
  const [to, setTo] = useState<Lang>("english");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [translationState, setTranslationState] = useState<any>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setInput(output);
    setOutput("");
  };

  const translate = async (textToTranslate: string) => {
    if (!textToTranslate.trim()) {
      setOutput("");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/lab/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          text: textToTranslate,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Translation request failed");

      const data = await res.json();
      const translatedText = data.translation || "";
      setOutput(translatedText);

      setTranslationState({ from, to, input: textToTranslate, output: translatedText });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setOutput(`Translation failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setOutput("");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      translate(input);
    }, 200);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, from, to]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <LabDashboardLayout title="Nepali Translator">
      <div className="p-8 max-w-[1100px] mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Nepali ↔ Roman ↔ English Translator</h2>
            <p className="text-[12px] text-[#9B9B98] mt-0.5">Translate between Devanagari Nepali, Roman Nepali (transliteration), and English using AI.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {(["nepali", "roman", "english"] as Lang[]).map((l) => (
              <span key={l} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F7F7F6] border border-[#E8E8E6] text-[#5C5C5A]">
                {l === "nepali" ? "नेपाली" : l === "roman" ? "Roman" : "English"}
              </span>
            ))}
          </div>
        </div>

        {/* Translation Panel */}
        <div className="bg-white border border-[#E8E8E6] rounded-2xl overflow-hidden">
          {/* Language selectors */}
          <div className="grid grid-cols-[1fr_auto_1fr] border-b border-[#E8E8E6]">
            <div className="px-5 py-3 flex items-center gap-3">
              <span className="text-[12px] font-medium text-[#9B9B98]">From:</span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value as Lang)}
                className="text-[13px] font-semibold text-[#1A1A1A] bg-transparent focus:outline-none cursor-pointer"
              >
                {(["nepali", "roman", "english"] as Lang[]).map(l => (
                  <option key={l} value={l}>{langLabels[l]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center px-4 border-x border-[#E8E8E6]">
              <button
                onClick={swap}
                className="p-2 rounded-lg hover:bg-[#F7F7F6] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors"
                title="Swap languages"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-3 flex items-center gap-3">
              <span className="text-[12px] font-medium text-[#9B9B98]">To:</span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as Lang)}
                className="text-[13px] font-semibold text-[#1A1A1A] bg-transparent focus:outline-none cursor-pointer"
              >
                {(["nepali", "roman", "english"] as Lang[]).map(l => (
                  <option key={l} value={l}>{langLabels[l]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Input / Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E8E8E6]">
            {/* Input */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type ${langLabels[from]} text here...\n\nExample: "${langExamples[from]}"`}
                className="w-full h-56 p-5 text-[14px] text-[#1A1A1A] focus:outline-none resize-none leading-relaxed placeholder:text-[#C5C5C0]"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] text-[#B5B5B0] font-mono">{input.length} chars · Live Translate Active</span>
                <button
                  onClick={() => setInput("")}
                  className="p-1.5 rounded-lg text-[#C5C5C0] hover:text-[#5C5C5A] hover:bg-[#F7F7F6] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="relative bg-[#FAFAF9]">
              <div className="h-56 p-5 text-[14px] text-[#1A1A1A] leading-relaxed overflow-y-auto">
                {loading && !output ? (
                  <div className="flex items-center gap-2 text-[#9B9B98]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[13px]">Translating...</span>
                  </div>
                ) : output ? (
                  <div className="whitespace-pre-wrap">
                    {output}
                    {loading && <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse align-text-bottom" />}
                  </div>
                ) : (
                  <span className="text-[#C5C5C0]">Translation appears here...</span>
                )}
              </div>
              {output && (
                <div className="absolute bottom-3 right-4 flex items-center gap-2">
                  <button
                    onClick={copy}
                    className="p-1.5 rounded-lg text-[#9B9B98] hover:text-[#1A1A1A] hover:bg-[#F0F0EE] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Footer */}
          <div className="px-5 py-4 border-t border-[#E8E8E6] flex items-center justify-between bg-white">
            <p className="text-[11px] text-[#9B9B98]">
              Supports: <span className="font-medium text-[#5C5C5A]">Devanagari ↔ Roman ↔ English</span>
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
              <Sparkles className="w-3 h-3" /> Auto-translating
            </div>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Quick Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { from: "roman", text: "Ma Nepal ma baschu", meaning: "I live in Nepal" },
              { from: "nepali", text: "धन्यवाद", meaning: "Thank you" },
              { from: "english", text: "How much does this cost?", meaning: "Translates to Nepali" },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setFrom(ex.from as Lang);
                  setInput(ex.text);
                  setOutput("");
                }}
                className="text-left p-3.5 rounded-xl border border-[#E8E8E6] hover:border-violet-300 hover:bg-violet-50/40 transition-all"
              >
                <p className="text-[13px] font-medium text-[#1A1A1A]">"{ex.text}"</p>
                <p className="text-[11px] text-[#9B9B98] mt-1">{ex.meaning} · {langLabels[ex.from as Lang]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <LabChatPanel
          toolName="Nepali Translator"
          currentToolState={translationState}
          className="h-[380px]"
          initialMessage="Hello! I'm your Nepali translation assistant. I can help you translate text, explain grammar, or answer questions about the Nepali language and Roman transliteration conventions."
        />

      </div>
    </LabDashboardLayout>
  );
}
