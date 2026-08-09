import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowUpRight, BookOpen, ExternalLink, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { getArticles } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Articles | Nabaraj KC | Software & AI Engineering",
  description: "Technical articles and deep-dives on AI operating systems, multi-agent architecture, PyTorch, and computer vision.",
  alternates: {
    canonical: "https://articles.nabarajkc.com.np",
  },
  openGraph: {
    title: "Articles | Nabaraj KC | Software & AI Engineering",
    description: "Technical articles and deep-dives on AI operating systems, multi-agent architecture, PyTorch, and computer vision.",
    url: "https://articles.nabarajkc.com.np",
    siteName: "Nabaraj KC",
    locale: "en_US",
    type: "website",
  },
};

export interface ArticleItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  content?: string;
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
      <Nav />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#8F8F8F] uppercase">
                Articles &amp; Writings
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#202020] tracking-tight leading-[1.05] max-w-4xl font-sans mb-6">
              Articles on AI systems, software architecture, and hardware.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-[#202020]/75 max-w-3xl leading-relaxed">
              Technical breakdowns, project architecture notes, and software engineering articles.
            </p>
          </ScrollReveal>

          {/* Subdomain Banner */}
          <ScrollReveal delay={250}>
            <div className="mt-8 p-4 bg-white rounded-xl border border-[#8F8F8F]/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#C85A17]" />
                <span className="font-mono text-xs text-[#202020]">
                  Hosted on subdomain: <strong className="text-[#C85A17]">articles.nabarajkc.com.np</strong>
                </span>
              </div>
              <a
                href="https://articles.nabarajkc.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#202020] hover:text-[#C85A17] transition-colors"
              >
                <span>Visit articles.nabarajkc.com.np</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </ScrollReveal>
        </section>

        {/* Articles List */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {articles.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-[#8F8F8F]/20 text-center font-mono text-sm text-[#8F8F8F]">
              No articles published yet.
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article, idx) => (
                <ScrollReveal key={article.slug} delay={idx * 100}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group block bg-[#FFFFFF] p-8 rounded-xl border border-[#8F8F8F]/20 shadow-whisper hover:border-[#C85A17]/40 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {article.coverImage && (
                        <div className="w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#8F8F8F]/15">
                          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="space-y-3 max-w-3xl flex-1">
                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8F8F8F]">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            <span>{(article as any).formattedPublishTime || article.date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            <span>{article.readTime}</span>
                          </span>
                          <span className="bg-[#F5F1E8] px-2.5 py-0.5 rounded text-[#202020] border border-[#8F8F8F]/20 font-semibold uppercase text-[10px]">
                            {article.tag}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-medium text-[#202020] group-hover:text-[#C85A17] transition-colors leading-snug">
                          {article.title}
                        </h2>

                        <p className="text-sm sm:text-base text-[#202020]/75 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 font-mono text-xs font-semibold text-[#202020] group-hover:text-[#C85A17] transition-colors">
                        <span>Read Article</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      </main>

      <FooterCTA />
    </div>
  );
}
