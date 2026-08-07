import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getProjects } from "@/lib/data";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tag: string;
  language: string;
  href: string;
  featured?: boolean;
}

export default async function WorkGrid() {
  const projects = await getProjects();

  return (
    <section id="work" className="py-24 md:py-32 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Title */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
              03 // Work
            </span>
            <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#202020] tracking-tight mb-16">
            Selected projects
          </h2>
        </ScrollReveal>

        {/* Minimalist Projects List */}
        <div className="mt-8 border-t border-[#8F8F8F]/20">
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={100 + i * 50}>
              <Link
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col md:flex-row md:items-start justify-between py-8 border-b border-[#8F8F8F]/20 hover:text-[#C85A17] transition-all duration-300 gap-6"
              >
                <div className="flex-grow max-w-4xl space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-[#C85A17] bg-[#C85A17]/10 px-2.5 py-0.5 rounded">
                      {project.tag}
                    </span>
                    {project.featured && (
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white bg-[#C85A17] px-2.5 py-0.5 rounded shadow-sm">
                        Featured
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-[#8F8F8F]">
                      // {project.category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-[#202020] tracking-tight group-hover:text-[#C85A17] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#202020]/70 leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#8F8F8F] group-hover:text-[#C85A17] transition-colors mt-2 md:mt-1.5 uppercase tracking-wider font-semibold">
                  <span>View Project</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
