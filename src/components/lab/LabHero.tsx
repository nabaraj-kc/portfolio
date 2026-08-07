"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

export default function LabHero() {
  const [isKineticActive, setIsKineticActive] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small delay for dramatic effect
            setTimeout(() => {
              setIsKineticActive(true);
            }, 300);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (headlineRef.current) {
      observer.observe(headlineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Background Noise Layer */}
      <div className="lab-noise" />

      {/* Text Column (Offset to left) */}
      <div className="relative z-10 max-w-2xl flex flex-col items-start w-full md:w-3/5">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#8F8F8F] uppercase">
              R&D Wing / Kathmandu
            </span>
          </div>
        </ScrollReveal>

        <h1
          ref={headlineRef}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-[100px] font-medium text-[#202020] leading-[1.05] tracking-tight font-sans mb-8 kinetic-text ${
            isKineticActive ? "is-active" : ""
          }`}
        >
          Experiments in Nabaraj's Lab.
        </h1>

        <ScrollReveal delay={200}>
          <p className="text-lg sm:text-xl text-[#202020]/75 max-w-xl leading-relaxed mb-8">
            Active architectural prototypes, model internals, Nepali-language AI tools, and system visualizations.
          </p>
          <a
            href="/lab/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#202020] hover:bg-purple-600 text-white font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-purple-200 hover:scale-[1.02]"
          >
            <span>Get Started</span>
            <span className="text-lg">→</span>
          </a>
        </ScrollReveal>
      </div>

      {/* 3D Glass Prism Anchor */}
      <div className="relative z-10 w-full md:w-2/5 flex justify-center md:justify-end mt-12 md:mt-0">
        <ScrollReveal delay={400}>
          <div className="relative w-64 h-64 md:w-80 md:h-80 group perspective-1000">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-[#C85A17]/20 blur-3xl rounded-full scale-125 opacity-60 group-hover:bg-[#C85A17]/30 transition-all duration-1000" />
            
            {/* The Lens / Prism Element */}
            <div className="relative w-full h-full rounded-full border border-white/40 shadow-2xl overflow-hidden transform-style-3d group-hover:rotate-x-12 group-hover:rotate-y-12 transition-transform duration-1000 ease-out">
              {/* Back Refraction Layer */}
              <div className="absolute inset-[-20%] bg-gradient-to-tr from-[#C85A17]/40 via-transparent to-indigo-500/10 blur-xl opacity-70" />
              
              {/* Core Glass Body */}
              <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
              
              {/* Internal Refraction / Spectral split */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/20" />
              
              {/* Surface Reflection Line */}
              <div className="absolute top-[15%] left-[15%] right-[15%] h-1/3 rounded-t-full bg-gradient-to-b from-white/50 to-transparent opacity-80" />
            </div>
            
            {/* Orbiting / Refracted Light Speck */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full shadow-[0_0_20px_4px_#C85A17] mix-blend-overlay animate-pulse" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
