"use client";

import ScrollReveal from "@/components/ScrollReveal";

const LAB_NOTES = [
  {
    date: "July 2026",
    text: "Shipped confidence scoring on the transliteration model, accuracy up 6%.",
  },
  {
    date: "June 2026",
    text: "Refactored Resume Analyzer to use structured multi-pass extraction.",
  },
  {
    date: "May 2026",
    text: "Prototyped lightweight WebGL renderer for attention head visualization.",
  },
];

export default function LabNotesStrip() {
  return (
    <section id="notes" className="w-full border-y border-[#8F8F8F]/15 bg-[#FFFFFF]/30 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 overflow-hidden">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#202020] shrink-0">
              Lab Notes
            </span>
            
            <div className="flex-grow flex items-center gap-8 overflow-x-auto no-scrollbar mask-edges">
              {LAB_NOTES.map((note, idx) => (
                <div key={idx} className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-[#8F8F8F]">{note.date}</span>
                  <span className="text-[#8F8F8F]/40">—</span>
                  <span className="text-sm text-[#202020]/80 font-medium">{note.text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
