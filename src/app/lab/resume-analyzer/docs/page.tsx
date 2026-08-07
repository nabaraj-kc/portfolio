import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, BookOpen, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume Analyzer Docs | Krrishmay Labs | ATS Score & Keyword Analysis",
  description: "Learn how to use the Krrishmay Labs AI Resume Analyzer. Understand ATS scoring, keyword matching, formatting checks, and how to maximize your resume's chances of getting through applicant tracking systems.",
  keywords: ["resume analyzer", "ATS score", "applicant tracking system", "resume keywords", "resume checker", "Nepal job search", "CV analysis AI"],
  alternates: { canonical: "https://labs.nabarajkc.com.np/lab/resume-analyzer/docs" },
};

export default function ResumeAnalyzerDocsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F6] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        
        {/* Back */}
        <Link href="/lab/resume-analyzer" className="inline-flex items-center gap-2 text-[13px] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Resume Analyzer
        </Link>

        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Documentation
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
            Resume Analyzer<br />Documentation
          </h1>
          <p className="text-[16px] text-[#5C5C5A] leading-relaxed max-w-xl">
            The Krrishmay Labs Resume Analyzer uses AI to give your CV an ATS (Applicant Tracking System) score, detect missing high-value skills, and provide formatting feedback — all in under 2 seconds.
          </p>
        </div>

        {/* TOC */}
        <nav className="bg-white border border-[#E8E8E6] rounded-2xl p-5">
          <h2 className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">Contents</h2>
          <ol className="space-y-1.5 text-[13px] text-violet-600">
            {["What is an ATS Score?", "How Scoring Works", "Keyword Analysis", "Formatting Feedback", "Skills Gap", "Tips to Improve Your Score", "Privacy & Data"].map((item, i) => (
              <li key={i} className="flex items-center gap-2 hover:text-violet-800 transition-colors">
                <span className="text-[#9B9B98] font-mono text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <section className="space-y-10">

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">What is an ATS Score?</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              An <strong>Applicant Tracking System (ATS)</strong> is software used by employers to filter and rank resumes before a human ever sees them. Studies show that over 75% of resumes are rejected by ATS before reaching a recruiter.
            </p>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              The ATS Score in our analyzer is a heuristic estimate (0–100) of how well your resume is likely to pass through common ATS filters. A score above 80 is considered strong.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">How Scoring Works</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">The score is calculated based on:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Keyword Density", desc: "Presence of role-specific keywords like Python, React, Docker, CI/CD" },
                { label: "Quantified Achievements", desc: "Use of numbers and metrics (e.g., '40% improvement')" },
                { label: "Technical Skills", desc: "In-demand skills matching common job descriptions" },
                { label: "Formatting Quality", desc: "Clean structure without tables or graphics that confuse parsers" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl p-4">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">{item.label}</p>
                  <p className="text-[12px] text-[#9B9B98]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Keyword Analysis</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              The analyzer scans your resume text for presence of high-value technical keywords and categorizes them as:
            </p>
            <ul className="space-y-2">
              {[
                { type: "pass", label: "Detected Skills", desc: "Skills found in your resume text — shown as green pill tags" },
                { type: "warning", label: "Missing High-Value Keywords", desc: "Common in-demand skills absent from your resume — shown as amber tags with + symbol" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px]">
                  {item.type === "pass" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                  <div>
                    <span className="font-semibold text-[#1A1A1A]">{item.label}: </span>
                    <span className="text-[#5C5C5A]">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Tips to Improve Your Score</h2>
            <div className="space-y-2">
              {[
                "Add quantified achievements: 'Reduced API latency by 40%' scores higher than 'improved API performance'",
                "Use standard section headings: Experience, Education, Skills, Projects",
                "Avoid tables, columns, and graphics — ATS parsers often skip over them",
                "Mirror the job description's exact wording in your bullet points",
                "Include tools like Docker, Kubernetes, CI/CD if you have experience with them",
                "Use the AI Assistant to rewrite specific bullet points for maximum impact",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-[13px] text-[#5C5C5A] bg-white border border-[#E8E8E6] rounded-xl p-3.5">
                  <span className="font-mono text-[#9B9B98] text-[11px] mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Privacy & Data</h2>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-[13px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-1">🔒 Your resume is never stored or transmitted to any server.</p>
              <p>All processing happens client-side in your browser using the JavaScript FileReader API. The extracted text is only sent to the AI assistant if you explicitly interact with the chat panel. No data is retained after you close the page.</p>
            </div>
          </div>

        </section>

        {/* CTA */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px]">Ready to analyze your resume?</h3>
            <p className="text-white/60 text-[13px] mt-1">Upload your PDF or DOCX and get results in seconds.</p>
          </div>
          <Link href="/lab/resume-analyzer" className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A1A1A] font-semibold text-[13px] rounded-xl hover:bg-gray-100 transition-colors">
            <FileText className="w-4 h-4" /> Open Tool
          </Link>
        </div>

      </div>
    </div>
  );
}
