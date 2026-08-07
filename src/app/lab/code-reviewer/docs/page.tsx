import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Code Reviewer Docs | Krrishmay Labs | Automated Security Audit",
  description: "Documentation for the Krrishmay Labs AI Code Reviewer. Learn how the tool detects SQL injection, XSS, missing validation, and other vulnerabilities with actionable fix suggestions.",
  keywords: ["code review", "security audit", "SQL injection", "XSS vulnerability", "OWASP", "code analysis", "AI code review", "static analysis"],
  alternates: { canonical: "https://labs.nabarajkc.com.np/lab/code-reviewer/docs" },
};

export default function CodeReviewerDocsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F6] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        
        <Link href="/lab/code-reviewer" className="inline-flex items-center gap-2 text-[13px] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Code Reviewer
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Documentation
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight leading-tight">Code Reviewer<br />Documentation</h1>
          <p className="text-[16px] text-[#5C5C5A] leading-relaxed max-w-xl">
            The Krrishmay Labs Code Reviewer performs automated static analysis on code snippets to detect security vulnerabilities, anti-patterns, and missing best practices.
          </p>
        </div>

        <section className="space-y-10">

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Detections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { level: "Critical", color: "red", items: ["SQL Injection via string concatenation", "XSS via innerHTML with unsanitized input", "Command injection via exec/eval"] },
                { level: "Warning", color: "amber", items: ["Missing input validation", "No error/exception handling", "Hardcoded credentials detected"] },
                { level: "Info", color: "blue", items: ["Functions with high cyclomatic complexity", "Deprecated APIs in use", "Missing type annotations"] },
              ].map((group, i) => (
                <div key={i} className={`bg-${group.color}-50 border border-${group.color}-100 rounded-2xl p-4`}>
                  <p className={`text-[12px] font-bold uppercase tracking-wider text-${group.color}-700 mb-2`}>{group.level}</p>
                  <ul className={`space-y-1 text-[12px] text-${group.color}-800`}>
                    {group.items.map((item, j) => <li key={j} className="flex items-start gap-1.5"><span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Supported Languages</h2>
            <div className="flex flex-wrap gap-2">
              {["Python", "TypeScript", "JavaScript", "Go", "Java", "SQL", "Bash", "PHP", "Ruby", "C/C++"].map(l => (
                <span key={l} className="text-[12px] font-medium px-3 py-1.5 rounded-lg bg-white border border-[#E8E8E6] text-[#5C5C5A]">{l}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Using the AI Assistant</h2>
            <p className="text-[14px] text-[#5C5C5A] leading-relaxed">
              After running the audit, the AI assistant receives the full context of your code snippet and all findings. You can ask it to:
            </p>
            <ul className="space-y-2">
              {[
                "Explain why a particular finding is dangerous",
                "Write a complete fixed/secure version of the code",
                "Review additional code you paste into the chat",
                "Explain the OWASP classification of a vulnerability",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#5C5C5A]">
                  <span className="text-indigo-500 mt-0.5">→</span> {item}
                </li>
              ))}
            </ul>
          </div>

        </section>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px]">Ready to audit your code?</h3>
            <p className="text-white/60 text-[13px] mt-1">Paste any snippet and get findings instantly.</p>
          </div>
          <Link href="/lab/code-reviewer" className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A1A1A] font-semibold text-[13px] rounded-xl hover:bg-gray-100 transition-colors">
            <Cpu className="w-4 h-4" /> Open Tool
          </Link>
        </div>

      </div>
    </div>
  );
}
