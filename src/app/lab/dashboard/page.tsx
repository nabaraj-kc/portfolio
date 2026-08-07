"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Cpu, Languages, BookOpen, ArrowRight, Clock, Star, Zap } from "lucide-react";
import LabDashboardLayout from "@/components/lab/LabDashboardLayout";
import LabChatPanel from "@/components/lab/LabChatPanel";

const labTools = [
  {
    id: "resume-analyzer",
    name: "Resume Analyzer",
    description: "ATS scoring, keyword gap analysis, and Claude-powered bullet rewrites for your resume.",
    icon: FileText,
    href: "/lab/resume-analyzer",
    tag: "Popular",
    docs: "/lab/resume-analyzer/docs",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Security audits, anti-pattern detection, and performance recommendations for any code snippet.",
    icon: Cpu,
    href: "/lab/code-reviewer",
    tag: "AI Powered",
    docs: "/lab/code-reviewer/docs",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "nepali-translator",
    name: "Nepali Translator",
    description: "Translate between Nepali (Devanagari), Roman Nepali, and English in real time.",
    icon: Languages,
    href: "/lab/nepali-translator",
    tag: "New",
    docs: "/lab/nepali-translator/docs",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "nepali-qa",
    name: "Nepali Q&A",
    description: "Answer questions in Nepali or about Nepal using an LLM grounded in Nepali context.",
    icon: BookOpen,
    href: "/lab/nepali-qa",
    tag: "Beta",
    docs: "/lab/nepali-qa/docs",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const recentWork = [
  { title: "Software_Engineer_CV_2026.pdf", tool: "Resume Analyzer", result: "74% ATS Score", time: "2 hours ago", icon: FileText },
  { title: "auth_middleware.ts", tool: "Code Reviewer", result: "Critical: SQL Injection", time: "Yesterday", icon: Cpu },
  { title: "नमस्ते Nepal → Roman", tool: "Nepali Translator", result: "Namaste Nepal", time: "2 days ago", icon: Languages },
];

const favourites = [
  { title: "Senior_Fullstack_Resume.pdf", tool: "Resume Analyzer", result: "92% ATS Score", icon: FileText },
];

export default function LabDashboardPage() {
  const router = useRouter();

  return (
    <LabDashboardLayout title="Dashboard">
      <div className="p-8 space-y-8 max-w-[1200px] mx-auto">

        {/* Welcome */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-violet-400" />
              Krrishmay Labs · Active
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Good morning, Nabaraj.</h2>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Your R&D workspace. Analyze resumes, audit code, translate Nepali, and more — all in one place.
            </p>
          </div>
          <Link
            href="/lab/resume-analyzer"
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#1A1A1A] font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg w-full md:w-auto"
          >
            Launch a Tool
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tools Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1A1A1A]">Lab Tools</h3>
            <span className="text-[11px] text-[#9B9B98] font-mono uppercase tracking-wider">{labTools.length} tools available</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {labTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => router.push(tool.href)}
                  className="group cursor-pointer bg-white border border-[#E8E8E6] rounded-2xl p-5 hover:border-[#1A1A1A]/30 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F7F6] text-[#5C5C5A] border border-[#E8E8E6]">
                        {tool.tag}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1A1A1A] group-hover:text-violet-600 transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-[12px] text-[#9B9B98] mt-1 leading-relaxed line-clamp-2">{tool.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[12px] font-medium text-[#5C5C5A] group-hover:text-violet-600 transition-colors">
                      Open Tool <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(tool.docs);
                      }}
                      className="text-[11px] text-[#9B9B98] hover:text-[#1A1A1A] transition-colors"
                    >
                      Docs →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Global Chatbot */}
          <div className="col-span-1 lg:col-span-7 flex flex-col">
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-4">Lab Assistant</h3>
            <LabChatPanel
              toolName="Krrishmay Labs"
              className="h-[420px]"
              initialMessage="Hi! I'm your Krrishmay Labs assistant. Ask me to analyze a resume, review code, or help you pick the right tool for your task."
            />
          </div>

          {/* Recent + Favourites */}
          <div className="col-span-1 lg:col-span-5 space-y-5">

            {/* Recent */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#9B9B98]" />
                <h3 className="text-base font-semibold text-[#1A1A1A]">Recent Work</h3>
              </div>
              <div className="space-y-2">
                {recentWork.map((item, i) => (
                  <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl p-3.5 flex items-center justify-between hover:border-[#1A1A1A]/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F7F7F6] border border-[#E8E8E6] flex items-center justify-center shrink-0">
                        <item.icon className="w-3.5 h-3.5 text-[#5C5C5A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{item.title}</p>
                        <p className="text-[11px] text-[#9B9B98]">{item.tool} · {item.time}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F7F7F6] text-[#5C5C5A] border border-[#E8E8E6] shrink-0 ml-2 whitespace-nowrap">
                      {item.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Favourites */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-semibold text-[#1A1A1A]">Favourites</h3>
              </div>
              <div className="space-y-2">
                {favourites.map((item, i) => (
                  <div key={i} className="bg-white border border-[#E8E8E6] rounded-xl p-3.5 flex items-center justify-between hover:border-[#1A1A1A]/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <item.icon className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{item.title}</p>
                        <p className="text-[11px] text-[#9B9B98]">{item.tool}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 ml-2">
                      {item.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </LabDashboardLayout>
  );
}
