import ScrollReveal from "./ScrollReveal";
import { getExperience } from "@/lib/data";

interface ExperienceItem {
  id: string;
  years: string;
  role: string;
  organization: string;
  description: string;
  tag: string;
  initials: string;
}

export default async function Timeline() {
  const experiences = await getExperience();

  return (
    <section id="experience" className="py-24 md:py-32 bg-transparent border-t border-[#8F8F8F]/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
              02 // Experience
            </span>
            <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#202020] tracking-tight mb-16">
            Work History
          </h2>
        </ScrollReveal>

        {/* Timeline entries */}
        <div className="space-y-0 divide-y divide-[#8F8F8F]/15">
          {experiences.map((exp, i) => (
            <ScrollReveal key={exp.id} delay={100 + i * 80}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 py-8">
                {/* Left: years */}
                <div className="sm:col-span-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] leading-relaxed">
                    {exp.years}
                  </p>
                </div>
                {/* Right: content */}
                <div className="sm:col-span-9">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F1E8] border border-[#8F8F8F]/20 flex items-center justify-center text-xs font-mono font-semibold text-[#202020] shrink-0">
                      {exp.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-[#202020] text-base">{exp.role}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] bg-[#F5F1E8] px-2.5 py-0.5 rounded-full">
                          {exp.tag}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#8F8F8F] mb-3">{exp.organization}</p>
                      <p className="text-sm text-[#202020]/70 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
