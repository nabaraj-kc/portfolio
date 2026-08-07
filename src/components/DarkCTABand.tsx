import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function DarkCTABand() {
  return (
    <section className="w-full bg-[#202020] text-[#F5F1E8] py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
          <div className="lg:col-span-8 space-y-4">
            <ScrollReveal>
              <div className="inline-flex items-center">
                <span className="font-mono text-xs text-[#8F8F8F] uppercase tracking-widest font-semibold">
                  Get in touch
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#F5F1E8] leading-tight font-sans">
                Interested in working together on software or AI projects?
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-base sm:text-lg text-[#8F8F8F] max-w-2xl font-normal leading-relaxed">
                If you need help building AI systems, web software, or hardware integrations, feel free to contact me.
              </p>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <ScrollReveal delay={300}>
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#F5F1E8] text-[#202020] font-medium text-base sm:text-lg hover:bg-white hover:scale-[1.02] transition-all shadow-md group"
              >
                <span>Send a message</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
