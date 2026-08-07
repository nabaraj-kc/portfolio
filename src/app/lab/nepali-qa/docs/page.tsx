import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, BookMarked } from "lucide-react";

export const metadata: Metadata = {
  title: "Nepali Q&A Docs | Krrishmay Labs | AI Question Answering in Nepali",
  description: "Documentation for the Krrishmay Labs Nepali Q&A tool. Ask questions in Nepali or about Nepal and get accurate, contextual answers powered by AI trained on Nepali language and culture.",
  keywords: ["nepali qa", "nepali question answer", "nepal ai", "nepali chatbot", "nepali language model", "nepal culture", "nepali NLP"],
  alternates: { canonical: "https://labs.nabarajkc.com.np/lab/nepali-qa/docs" },
};

export default function NepaliQADocsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F6] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">

        <Link href="/lab/nepali-qa" className="inline-flex items-center gap-2 text-[13px] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Nepali Q&A
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Documentation
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
            Nepali Q&A<br />Documentation
          </h1>
          <p className="text-[16px] text-[#5C5C5A] leading-relaxed max-w-xl">
            Ask questions in Nepali (Devanagari or Roman) or about Nepal — geography, culture, history, language — and receive accurate, contextual AI answers.
          </p>
        </div>

        <section className="space-y-10">

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: "Language Questions", desc: "Ask about Nepali grammar, vocabulary, or writing systems" },
                { title: "Cultural Context", desc: "Festivals, traditions, food, and Nepali customs explained" },
                { title: "Geography & History", desc: "Information about Nepal's districts, cities, mountains, and history" },
                { title: "Bilingual Answers", desc: "Get answers in Nepali, Roman Nepali, or English — just ask" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl p-4">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">{item.title}</p>
                  <p className="text-[12px] text-[#9B9B98]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Example Questions</h2>
            <div className="space-y-2">
              {[
                { q: "Nepal ko raajdhani ko naam ke ho?", lang: "Roman Nepali" },
                { q: "नेपालमा कति जिल्ला छन्?", lang: "Devanagari" },
                { q: "What is Dashain festival in Nepal?", lang: "English" },
                { q: "Nepali language ma 'thank you' kasari bhancha?", lang: "Roman Nepali" },
                { q: "माउन्ट एभरेस्टको उचाइ कति छ?", lang: "Devanagari" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="text-[13px] text-[#1A1A1A] font-medium">"{item.q}"</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F7F6] text-[#9B9B98] border border-[#E8E8E6] shrink-0 ml-3">{item.lang}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">How to Use</h2>
            <ol className="space-y-3">
              {[
                "Type or paste your question in the input box — Nepali (any script) or English",
                "Press Enter or click the Send button",
                "The AI streams the answer token by token — no waiting for the full response",
                "Ask follow-up questions in the same session to maintain context",
                "Attach a text file with multiple questions to process in bulk",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-[#5C5C5A]">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-bold shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

        </section>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px]">Ready to ask in Nepali?</h3>
            <p className="text-white/60 text-[13px] mt-1">Questions answered in Nepali, Roman, or English.</p>
          </div>
          <Link href="/lab/nepali-qa" className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A1A1A] font-semibold text-[13px] rounded-xl hover:bg-gray-100 transition-colors">
            <BookMarked className="w-4 h-4" /> Open Tool
          </Link>
        </div>

      </div>
    </div>
  );
}
