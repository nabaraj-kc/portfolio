import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Languages } from "lucide-react";

export const metadata: Metadata = {
  title: "Nepali Translator Docs | Krrishmay Labs | Roman Nepali ↔ Devanagari ↔ English",
  description: "Documentation for the Krrishmay Labs Nepali Translator. Learn how to translate between Roman Nepali (transliteration), Devanagari script, and English using AI-powered real-time translation.",
  keywords: ["nepali translator", "roman nepali", "devanagari", "nepali to english", "english to nepali", "roman to nepali", "transliteration", "nepal language AI"],
  alternates: { canonical: "https://labs.nabarajkc.com.np/lab/nepali-translator/docs" },
};

export default function NepaliTranslatorDocsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F6] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        
        <Link href="/lab/nepali-translator" className="inline-flex items-center gap-2 text-[13px] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Nepali Translator
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Documentation
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
            Nepali Translator<br />Documentation
          </h1>
          <p className="text-[16px] text-[#5C5C5A] leading-relaxed max-w-xl">
            The Krrishmay Labs Nepali Translator provides AI-powered real-time translation between Nepali Devanagari script, Roman Nepali (Romanized transliteration), and English.
          </p>
        </div>

        <section className="space-y-10">

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Translation Modes</h2>
            <div className="space-y-3">
              {[
                { from: "Roman Nepali", to: "Devanagari", example: "Namaste → नमस्ते", note: "Converts informal Roman transliteration to proper Nepali script" },
                { from: "Roman Nepali", to: "English", example: "Dhanyabad → Thank you", note: "Translates romanized Nepali words/phrases to English" },
                { from: "Devanagari", to: "English", example: "नमस्ते → Hello/Greetings", note: "Translates Nepali script to natural English" },
                { from: "English", to: "Devanagari", example: "How are you → तपाईंलाई कस्तो छ?", note: "Converts English text to formal Nepali Devanagari" },
                { from: "English", to: "Roman Nepali", example: "Thank you → Dhanyabad", note: "Converts English to Roman Nepali transliteration" },
              ].map((mode, i) => (
                <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl p-4 grid grid-cols-[1fr_1fr_2fr] gap-4 items-center">
                  <div>
                    <p className="text-[11px] text-[#9B9B98] uppercase tracking-wider mb-1">From</p>
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">{mode.from}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9B9B98] uppercase tracking-wider mb-1">To</p>
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">{mode.to}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-mono text-emerald-600">{mode.example}</p>
                    <p className="text-[11px] text-[#9B9B98] mt-0.5">{mode.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">What is Roman Nepali?</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              <strong>Roman Nepali</strong> (also called Romanized Nepali) is the informal system Nepali speakers use to write Nepali words using the English/Latin alphabet — primarily on phones and computers. It is widely used in SMS, social media, and casual communication in Nepal.
            </p>
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 grid grid-cols-3 gap-4 text-[13px]">
              <div><p className="text-[#9B9B98] text-[11px] mb-1">Roman Nepali</p><p className="font-semibold text-[#1A1A1A]">Ma thik chu</p></div>
              <div><p className="text-[#9B9B98] text-[11px] mb-1">Devanagari</p><p className="font-semibold text-[#1A1A1A]">म ठिक छु</p></div>
              <div><p className="text-[#9B9B98] text-[11px] mb-1">English</p><p className="font-semibold text-[#1A1A1A]">I am fine</p></div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">AI Assistant</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              The integrated chat assistant has full context of your current translation. Use it to:
            </p>
            <ul className="space-y-2">
              {[
                "Ask for formal vs. informal variations of a translation",
                "Understand the nuance or cultural context of a phrase",
                "Get help with Nepali grammar rules",
                "Translate longer paragraphs or documents",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#5C5C5A]">
                  <span className="text-emerald-500 mt-0.5">→</span> {item}
                </li>
              ))}
            </ul>
          </div>

        </section>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px]">Ready to translate?</h3>
            <p className="text-white/60 text-[13px] mt-1">Supports Roman ↔ Nepali ↔ English in real time.</p>
          </div>
          <Link href="/lab/nepali-translator" className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A1A1A] font-semibold text-[13px] rounded-xl hover:bg-gray-100 transition-colors">
            <Languages className="w-4 h-4" /> Open Tool
          </Link>
        </div>

      </div>
    </div>
  );
}
