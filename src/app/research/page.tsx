import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowUpRight, Download, Microscope, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getResearch } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Research | Nabaraj KC | AI Operating Systems",
  description: "Research notes and system designs for the O AI operating system, Krrishmay multi-agent assistant, and hardware integration.",
  alternates: {
    canonical: "https://research.nabarajkc.com.np",
  },
  openGraph: {
    title: "Research | Nabaraj KC | AI Operating Systems",
    description: "Research notes and system designs for the O AI operating system, Krrishmay multi-agent assistant, and hardware integration.",
    url: "https://research.nabarajkc.com.np",
    siteName: "Nabaraj KC Research",
    locale: "en_US",
    type: "website",
  },
};

interface Paper {
  id: string;
  title: string;
  conference: string;
  year: string;
  abstract: string;
  pdfUrl: string;
  tags: string[];
  coverImage?: string;
}

interface FocusArea {
  id: string;
  title: string;
  description: string;
  metrics: string;
}

interface ResearchData {
  focusAreas: FocusArea[];
  papers: Paper[];
}

const iconsMap = [Microscope, Layers, BookOpen];

export default async function ResearchPage() {
  const allResearch = await getResearch();
  
  const seedConfig = allResearch.find((r: any) => r.papers && r.focusAreas) || { focusAreas: [], papers: [] };
  
  const dynamicPapers = allResearch
    .filter((r: any) => !r.focusAreas && (r.title || r.slug))
    .map((p: any) => ({
      id: p.slug || p._id?.toString(),
      _id: p._id?.toString(),
      slug: p.slug,
      title: p.title,
      conference: p.tag || "AI Research Specification",
      year: p.formattedPublishTime || p.date || "2026",
      abstract: p.excerpt || p.abstract || "",
      content: p.content || p.abstract || p.excerpt || "",
      pdfUrl: "#",
      tags: p.keywords || [],
      formattedPublishTime: p.formattedPublishTime,
      coverImage: p.coverImage
    }));

  const data: ResearchData = {
    focusAreas: seedConfig.focusAreas || [],
    papers: [...dynamicPapers, ...(seedConfig.papers || [])]
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
      <Nav />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Header Hero Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#8F8F8F] uppercase">
                Research / Kathmandu, Nepal
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#202020] tracking-tight leading-[1.05] max-w-4xl font-sans mb-6">
              AI operating systems and hardware control research.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-[#202020]/75 max-w-3xl leading-relaxed">
              Notes and system designs for the O AI operating system, Krrishmay multi-agent architecture, and hardware control interfaces.
            </p>
          </ScrollReveal>
        </section>

        {/* Research Focus Areas Grid */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
                01 // Key Areas
              </span>
              <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-12">
            {data.focusAreas.map((area, idx) => {
              const Icon = iconsMap[idx % iconsMap.length];
              return (
                <ScrollReveal key={area.id || area.title} delay={idx * 150}>
                  <div className="flex flex-col justify-between h-full md:border-r last:border-none border-[#8F8F8F]/20 md:pr-8 last:pr-0">
                    <div>
                      <div className="p-2.5 w-fit rounded-lg bg-[#202020]/5 text-[#C85A17] mb-6">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-medium text-[#202020] mb-3 leading-snug">
                        {area.title}
                      </h3>
                      <p className="text-sm text-[#202020]/75 leading-relaxed mb-6">
                        {area.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#8F8F8F]/15 font-mono text-[11px] text-[#C85A17] font-semibold uppercase tracking-wider">
                      {area.metrics}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Publications & Whitepapers Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
                02 // System Specs &amp; Technical Reports
              </span>
              <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#202020] tracking-tight mb-12">
              System Specifications
            </h2>
          </ScrollReveal>

          <div className="border-t border-[#8F8F8F]/20 divide-y divide-[#8F8F8F]/20">
            {data.papers.map((paper, idx) => (
              <ScrollReveal key={paper.id || paper.title} delay={idx * 100}>
                <div className="py-8 group flex flex-col md:flex-row md:items-start justify-between gap-6 hover:text-[#C85A17] transition-all duration-300">
                  {paper.coverImage && (
                    <div className="w-full md:w-44 h-28 shrink-0 rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#8F8F8F]/15">
                      <img src={paper.coverImage} alt={paper.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <Link href={`/research/${paper.id}`} className="flex-grow max-w-4xl space-y-3">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#8F8F8F]">
                      <span className="bg-[#202020]/5 px-2.5 py-0.5 rounded text-[#C85A17] font-semibold">
                        {paper.year}
                      </span>
                      <span>{paper.conference}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-medium text-[#202020] group-hover:text-[#C85A17] transition-colors leading-snug">
                      {paper.title}
                    </h3>

                    <p className="text-sm text-[#202020]/70 leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      {paper.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] bg-[#FFFFFF]/80 px-2.5 py-0.5 rounded border border-[#8F8F8F]/15 text-[#202020]/75"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 mt-4 md:mt-2 shrink-0">
                    <Link
                      href={`/research/${paper.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#8F8F8F]/30 hover:border-[#C85A17] text-[#202020] hover:text-[#C85A17] text-xs font-mono transition-colors"
                    >
                      <span>Read Spec</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ScrollReveal>
            <div className="bg-[#202020] text-[#F5F1E8] p-8 sm:p-12 rounded-2xl relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#C85A17]">
                  Collaboration
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[#F5F1E8]">
                  Interested in multi-agent research or software collaboration?
                </h2>
                <p className="text-sm sm:text-base text-[#8F8F8F] leading-relaxed">
                  Feel free to get in touch if you'd like to collaborate on multi-agent software or AI system development.
                </p>
                <div className="pt-4">
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5F1E8] text-[#202020] text-sm font-medium hover:bg-white transition-colors"
                  >
                    <span>Get in touch</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <FooterCTA />
    </div>
  );
}
