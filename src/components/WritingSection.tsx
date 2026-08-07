import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getArticles } from "@/lib/data";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
}

export default async function WritingSection() {
  const allArticles = await getArticles();
  const articles = allArticles.slice(0, 3);

  return (
    <section id="writing" className="py-24 md:py-32 bg-transparent border-t border-[#8F8F8F]/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
                04 // Writing
              </span>
              <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
            </div>
            <Link
              href="/articles"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors"
            >
              All articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#202020] tracking-tight mb-16">
            Notes & writing
          </h2>
        </ScrollReveal>

        <div className="space-y-0 divide-y divide-[#8F8F8F]/15">
          {articles.map((article, i) => (
            <ScrollReveal key={`${article.slug || 'article'}-${i}`} delay={100 + i * 80}>
              <Link
                href={`/articles/${article.slug}`}
                className="group flex items-start justify-between gap-8 py-7 hover:pl-1 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">{article.date}</span>
                    <span className="font-mono text-[10px] text-[#8F8F8F]/60">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-[#202020] tracking-tight group-hover:text-[#C85A17] transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#202020]/60 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <span className="font-mono text-[10px] text-[#8F8F8F] bg-[#F5F1E8] px-2.5 py-1 rounded-full whitespace-nowrap">
                    {article.tag}
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 pt-6 border-t border-[#8F8F8F]/15">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors"
            >
              View all articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
