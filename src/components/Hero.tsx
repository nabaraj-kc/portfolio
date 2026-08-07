import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getSettings } from "@/lib/data";

interface Settings {
  eyebrow: string;
  headline: string;
  bio: string;
  availability: string;
  ctaLabel: string;
  ctaHref: string;
}

const defaultSettings: Settings = {
  eyebrow: "Software Engineer / Kathmandu, Nepal",
  headline: "Software engineer focused on AI systems and hardware integration.",
  bio: "I'm Nabaraj KC. I build AI systems, machine learning pipelines, and hardware tools. Currently developing O, an AI operating system powered by Krrishmay assistant.",
  availability: "Available for software & AI projects",
  ctaLabel: "Try Krrishmay AI Chatbot",
  ctaHref: "https://krrishmay.nabarajkc.com.np",
};

export default async function Hero() {
  const dbSettings = await getSettings();
  const settings = { ...defaultSettings, ...(dbSettings || {}) };

  return (
    <section className="relative min-h-[90vh] pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col justify-between overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        {/* Eyebrow Label (NO DOTS) */}
        <ScrollReveal delay={100}>
          <div className="inline-flex items-center mb-6 sm:mb-8">
            <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#8F8F8F] uppercase">
              {settings.eyebrow}
            </span>
          </div>
        </ScrollReveal>

        {/* Hero Headline + Photo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          {/* Main Headline */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={200}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] font-medium text-[#202020] tracking-tight leading-[1.05] font-sans">
                {settings.headline}
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p className="text-lg sm:text-xl md:text-2xl text-[#202020]/75 font-normal max-w-2xl leading-relaxed pt-2">
                {settings.bio}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={settings.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#8F8F8F]/30 bg-white font-mono text-xs text-[#202020] hover:border-[#C85A17] hover:text-[#C85A17] transition-all shadow-sm"
                >
                  <span>{settings.ctaLabel}</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Portrait Photo (NO DOTS) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-end pt-6 lg:pt-0">
            <ScrollReveal delay={400} className="w-full">
              <div className="relative group cursor-pointer w-full max-w-lg mx-auto lg:max-w-none">
                <div className="relative w-full flex flex-col items-center justify-end">
                  <Image
                    src="/images/user-profile-transparent.png"
                    alt="Nabaraj KC portrait"
                    width={800}
                    height={600}
                    priority
                    unoptimized
                    className="w-full max-w-[500px] lg:max-w-[550px] h-auto object-contain scale-105 sm:scale-110 lg:scale-115 group-hover:scale-120 active:scale-105 transition-transform duration-500 ease-out drop-shadow-md origin-bottom"
                  />
                  <div className="mt-4 bg-[#F5F1E8]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#8F8F8F]/30 flex items-center gap-2 text-xs font-mono shadow-sm group-hover:border-[#C85A17] transition-colors">
                    <span className="text-[#202020] font-medium">Nabaraj KC</span>
                    <span className="text-[#8F8F8F]">/ Kathmandu, Nepal</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Sub-fold CTA link */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-[#8F8F8F]/20 flex items-center justify-between">
          <ScrollReveal delay={500}>
            <Link
              href="#work"
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-[#202020] hover:text-[#C85A17] transition-colors group"
            >
              <span>Explore my projects</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={550}>
            <span className="hidden sm:inline-block font-mono text-xs text-[#8F8F8F] uppercase tracking-widest">
              {settings.availability}
            </span>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
