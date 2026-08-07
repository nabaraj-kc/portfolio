import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { getSettings } from "@/lib/data";

const skills = [
  { name: "Python" },
  { name: "PyTorch" },
  { name: "TensorFlow" },
  { name: "Multi-Agent Systems" },
  { name: "Generative UI" },
  { name: "RAG Systems" },
  { name: "Hardware Interfaces" },
  { name: "Computer Vision" },
  { name: "TypeScript & Next.js" },
  { name: "Docker & Linux" },
  { name: "Arduino & IoT" },
  { name: "C++" },
];

interface AboutSettings {
  aboutHeadline: string;
  aboutBio1: string;
  aboutBio2: string;
  statAgents: string;
  statAccuracy: string;
}

const defaultAboutSettings: AboutSettings = {
  aboutHeadline: "Software engineer building AI applications and hardware systems.",
  aboutBio1: "I'm Nabaraj KC, a software engineer living in Kathmandu. I work on machine learning models, multi-agent software, and hardware automation.",
  aboutBio2: "My main project right now is O, an AI operating system centered on an assistant named Krrishmay. It runs a network of specialized agents, uses Generative UI and RAG for task execution, and connects directly to hardware devices like CPU/GPU metrics, audio, cameras, and Arduino controllers.",
  statAgents: "100+",
  statAccuracy: "98%",
};

export default async function About() {
  const dbSettings = await getSettings();
  const settings = { ...defaultAboutSettings, ...(dbSettings || {}) };

  return (
    <section id="about" className="py-24 md:py-32 bg-transparent border-t border-[#8F8F8F]/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
              01 // About
            </span>
            <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Bio */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={100}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#202020] tracking-tight leading-tight">
                {settings.aboutHeadline}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="space-y-4 text-base sm:text-lg text-[#202020]/80 leading-relaxed font-normal">
                <p>{settings.aboutBio1}</p>
                <p>{settings.aboutBio2}</p>
              </div>
            </ScrollReveal>

            {/* Social Links */}
            <ScrollReveal delay={300}>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="https://github.com/nabaraj-kc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-[#202020] hover:text-[#C85A17] transition-colors border border-[#8F8F8F]/30 px-4 py-2 rounded-full hover:border-[#C85A17]"
                >
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/nabaraj-kc-8a8081282/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-[#202020] hover:text-[#C85A17] transition-colors border border-[#8F8F8F]/30 px-4 py-2 rounded-full hover:border-[#C85A17]"
                >
                  LinkedIn
                </Link>
              </div>
            </ScrollReveal>

            {/* Skills Grid */}
            <ScrollReveal delay={350}>
              <div className="pt-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F] mb-5">
                  Skills &amp; Technologies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center bg-[#FFFFFF] border border-[#8F8F8F]/15 rounded-lg px-3 py-2.5 hover:border-[#C85A17]/40 transition-colors"
                    >
                      <span className="font-mono text-xs text-[#202020] font-medium">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Stats + Photo */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stats Card */}
            <ScrollReveal delay={300}>
              <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-xl shadow-whisper border border-[#8F8F8F]/20 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-mono text-4xl sm:text-5xl font-bold text-[#202020] tracking-tight">
                      {settings.statAgents}
                    </div>
                    <div className="font-mono text-xs text-[#8F8F8F] uppercase tracking-wider font-semibold mt-1">
                      Agents in O System
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-4xl sm:text-5xl font-bold text-[#202020] tracking-tight">
                      {settings.statAccuracy}
                    </div>
                    <div className="font-mono text-xs text-[#8F8F8F] uppercase tracking-wider font-semibold mt-1">
                      KYC Image Precision
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#8F8F8F]/15 pt-5">
                  <div className="font-mono text-2xl font-bold text-[#202020] tracking-tight">
                    AI &amp; Systems
                  </div>
                  <div className="font-mono text-xs text-[#8F8F8F] uppercase tracking-wider font-semibold mt-1">
                    Primary Focus
                  </div>
                  <p className="text-sm text-[#202020]/70 pt-2 leading-snug">
                    Building the O AI operating system, Krrishmay assistant, and software applications.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Profile Image */}
            <ScrollReveal delay={400}>
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-whisper border border-[#8F8F8F]/20 group">
                <Image
                  src="/images/user-profile-transparent.png"
                  alt="Nabaraj KC portrait"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-[#202020]/10" />
                <div className="absolute bottom-3 left-3 bg-[#F5F1E8]/90 backdrop-blur-sm px-3 py-1 rounded text-[11px] font-mono text-[#202020]">
                  Nabaraj KC / Kathmandu, Nepal
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
