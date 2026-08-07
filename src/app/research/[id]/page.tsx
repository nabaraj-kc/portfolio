import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowLeft, Calendar, BookOpen, Download } from "lucide-react";
import Link from "next/link";
import { getResearch } from "@/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SocialActions from "@/components/SocialActions";
import AudioBookPlayer from "@/components/AudioBookPlayer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { shortenTitle } from "@/lib/title-utils";
import { ensureTableOfContents } from "@/lib/toc-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const allResearch = await getResearch();
  
  const seedConfig = allResearch.find((r: any) => r.papers && r.focusAreas);
  const papers = seedConfig?.papers || [];
  let paper = papers.find((p: any) => p.id === resolvedParams.id);

  if (!paper) {
    const rawPaper = allResearch.find((r: any) => r.slug === resolvedParams.id || r._id?.toString() === resolvedParams.id);
    if (rawPaper) {
      paper = {
        id: rawPaper.slug || rawPaper._id?.toString(),
        title: rawPaper.title,
        conference: rawPaper.tag || "AI Research Specification",
        year: rawPaper.formattedPublishTime || rawPaper.date || "2026",
        abstract: rawPaper.abstract || rawPaper.excerpt || "",
        content: rawPaper.content || rawPaper.abstract || rawPaper.excerpt || "",
        pdfUrl: "#",
        tags: rawPaper.keywords || [],
        coverImage: rawPaper.coverImage
      };
    }
  }

  if (!paper) {
    return {
      title: "Research Paper Not Found",
    };
  }

  return {
    title: `${paper.title} | Nabaraj KC Research`,
    description: paper.abstract?.slice(0, 160) || paper.content?.slice(0, 160),
  };
}

export default async function ResearchDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const allResearch = await getResearch();
  
  const seedConfig = allResearch.find((r: any) => r.papers && r.focusAreas);
  const papers = seedConfig?.papers || [];
  let paper = papers.find((p: any) => p.id === resolvedParams.id);

  if (!paper) {
    const rawPaper = allResearch.find((r: any) => r.slug === resolvedParams.id || r._id?.toString() === resolvedParams.id);
    if (rawPaper) {
      paper = {
        id: rawPaper.slug || rawPaper._id?.toString(),
        title: rawPaper.title,
        conference: rawPaper.tag || "AI Research Specification",
        year: rawPaper.formattedPublishTime || rawPaper.date || "2026",
        abstract: rawPaper.abstract || rawPaper.excerpt || "",
        content: rawPaper.content || rawPaper.abstract || rawPaper.excerpt || "",
        pdfUrl: "#",
        tags: rawPaper.keywords || [],
        coverImage: rawPaper.coverImage
      };
    }
  }

  if (!paper) {
    notFound();
  }

  let renderContent = (paper as any).content || paper.abstract || "";

  if (typeof renderContent === "string" && (renderContent.trim().startsWith("```json") || renderContent.trim().startsWith("{"))) {
    try {
      const cleaned = renderContent.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const strToParse = jsonMatch ? jsonMatch[0] : cleaned;
      const parsed = JSON.parse(strToParse);
      if (parsed && parsed.content) renderContent = parsed.content;
    } catch {
      // Fallback regex extraction of "content": "..."
      const match = renderContent.match(/"content"\s*:\s*"([\s\S]*)"\s*}/i);
      if (match && match[1]) {
        renderContent = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
    }
  }

  // Pre-process markdown: Unwrap ```markdown fences, remove duplicate top h1 & ensure mandatory Table of Contents
  renderContent = renderContent
    .replace(/^#\s+[^\n]+\n+/, "")
    .replace(/```markdown\s*([\s\S]*?)\s*```/gi, (m: string, inner: string) => {
      if (inner.includes("Table of Contents") || inner.includes("# ") || inner.includes("## ")) return inner;
      return m;
    })
    .replace(/^```markdown\s*$/gm, "")
    .replace(/^```\s*$/gm, "");

  renderContent = ensureTableOfContents(renderContent);

  const displayTitle = shortenTitle(paper.title);

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
      <Nav />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Back link */}
          <ScrollReveal>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors mb-8 uppercase tracking-widest font-semibold"
            >
              <ArrowLeft size={14} />
              <span>Back to Research</span>
            </Link>
          </ScrollReveal>

          {/* Paper Header */}
          <ScrollReveal delay={100}>
            <div className="space-y-4 mb-12">
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8F8F8F]">
                <span className="flex items-center gap-1 bg-[#202020] text-[#F5F1E8] px-2.5 py-0.5 rounded font-semibold text-[10px]">
                  {paper.year}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={13} />
                  <span>{paper.conference}</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#202020] tracking-tight leading-tight">
                {displayTitle}
              </h1>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                {paper.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] bg-[#FFFFFF] px-2.5 py-1 rounded border border-[#8F8F8F]/20 text-[#202020]/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {(paper as any).coverImage && (
            <ScrollReveal delay={120}>
              <div className="mb-8 overflow-hidden rounded-2xl border border-[#8F8F8F]/20 shadow-sm bg-[#1E1E1E]">
                <img
                  src={(paper as any).coverImage}
                  alt={paper.title}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover hover:scale-102 transition-transform duration-500"
                />
              </div>
            </ScrollReveal>
          )}

          {/* Audiobook Player */}
          <ScrollReveal delay={150}>
            <AudioBookPlayer
              id={paper.id}
              title={displayTitle}
              speakText={renderContent}
            />
          </ScrollReveal>

          {/* Paper Content */}
          <div id="research-body" className="bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#8F8F8F]/20 shadow-whisper space-y-6 text-base sm:text-lg text-[#202020]/85 leading-relaxed overflow-hidden">
            <div className="prose prose-lg max-w-none prose-p:text-[#202020]/85 prose-headings:text-[#202020] prose-headings:font-medium prose-a:text-[#C85A17] hover:prose-a:underline prose-strong:text-[#202020] prose-strong:font-semibold">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const contentStr = String(children).trim();
                    if (contentStr.includes("Table of Contents") || contentStr.includes("(#") || contentStr.startsWith("- [")) {
                      return <span className="font-sans text-[#202020] bg-transparent p-0">{children}</span>;
                    }
                    return (
                      <code className="text-[#C85A17] bg-[#F5F1E8] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }: any) {
                    const rawText = String(children?.props?.children || children || "");
                    if (rawText.includes("Table of Contents") || (rawText.includes("- [") && rawText.includes("](#"))) {
                      return (
                        <div className="my-8 p-6 sm:p-8 bg-[#FAF9F5] rounded-2xl border border-[#8F8F8F]/20 shadow-sm text-[#202020]">
                          {children}
                        </div>
                      );
                    }
                    return <pre className="bg-[#1E1E1E] text-white p-5 rounded-xl overflow-x-auto text-sm my-6 font-mono">{children}</pre>;
                  },
                  h2({ children }: any) {
                    const textStr = String(children).trim();
                    const idSlug = textStr.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                    if (textStr.toLowerCase().includes("table of contents")) {
                      return (
                        <h2 className="text-xs font-mono font-semibold text-[#8F8F8F] border-b border-[#8F8F8F]/20 pb-2 mt-6 mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <span className="text-[#C85A17]">📋</span> Table of Contents
                        </h2>
                      );
                    }
                    return (
                      <h2 id={idSlug} className="text-2xl sm:text-3xl font-semibold text-[#202020] mt-10 mb-4 tracking-tight scroll-mt-24">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }: any) {
                    const textStr = String(children).trim();
                    const idSlug = textStr.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                    return (
                      <h3 id={idSlug} className="text-xl font-medium text-[#202020] mt-8 mb-3 tracking-tight scroll-mt-24">
                        {children}
                      </h3>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="my-8 overflow-x-auto rounded-xl border border-[#8F8F8F]/20 shadow-sm bg-[#FFFFFF]">
                        <table className="w-full text-left text-sm font-sans border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }: any) {
                    return <thead className="bg-[#F5F1E8] border-b border-[#8F8F8F]/20 text-[#202020] font-semibold">{children}</thead>;
                  },
                  th({ children }: any) {
                    return <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#202020] border-r border-[#8F8F8F]/15 last:border-r-0">{children}</th>;
                  },
                  tr({ children }: any) {
                    return <tr className="border-b border-[#8F8F8F]/15 hover:bg-[#FAF9F5] transition-colors last:border-b-0">{children}</tr>;
                  },
                  td({ children }: any) {
                    return <td className="px-4 py-3 text-[#202020]/85 border-r border-[#8F8F8F]/10 last:border-r-0 font-sans leading-relaxed">{children}</td>;
                  },
                  hr() {
                    return <hr className="my-10 border-t-2 border-[#8F8F8F]/20" />;
                  },
                  blockquote({ children }: any) {
                    return (
                      <blockquote className="my-6 pl-5 py-3 border-l-4 border-[#C85A17] bg-[#FAF9F5] rounded-r-xl text-[#202020]/90 italic font-sans">
                        {children}
                      </blockquote>
                    );
                  },
                  ul({ children }: any) {
                    return <ul className="my-3 space-y-2 text-[#202020]/90 font-sans leading-relaxed list-none pl-0">{children}</ul>;
                  },
                  li({ children }: any) {
                    return (
                      <li className="text-sm sm:text-base text-[#202020]/85 flex items-start gap-2 hover:text-[#C85A17] transition-colors">
                        <span className="text-[#C85A17] mt-1.5 text-xs font-mono">▸</span>
                        <div className="flex-1">{children}</div>
                      </li>
                    );
                  },
                  a({ href, children }: any) {
                    return (
                      <a href={href} className="text-[#202020] hover:text-[#C85A17] font-medium transition-colors decoration-[#C85A17]/30 underline-offset-4">
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {renderContent}
              </ReactMarkdown>
            </div>

            {paper.pdfUrl && paper.pdfUrl !== "#" && (
              <div className="pt-6">
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#202020] text-[#F5F1E8] text-xs font-mono font-medium hover:bg-[#C85A17] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF Specification</span>
                </a>
              </div>
            )}
          </div>

          {/* Social Actions Integration */}
          <ScrollReveal delay={250}>
            <SocialActions id={paper.id} title={paper.title} copyText={paper.abstract} />
          </ScrollReveal>
        </article>
      </main>

      <FooterCTA />
    </div>
  );
}
