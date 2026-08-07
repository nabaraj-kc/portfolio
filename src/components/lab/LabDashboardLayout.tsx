"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Cpu, Search, Bell, Settings, Languages, BookOpen, Menu, X
} from "lucide-react";
import React, { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/lab/dashboard" },
  { label: "Resume Analyzer", icon: FileText, href: "/lab/resume-analyzer" },
  { label: "Code Reviewer", icon: Cpu, href: "/lab/code-reviewer" },
  { label: "Nepali Translator", icon: Languages, href: "/lab/nepali-translator" },
  { label: "Nepali Q&A", icon: BookOpen, href: "/lab/nepali-qa" },
];

export default function LabDashboardLayout({
  children,
  title = "Dashboard",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[#F7F7F6] font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[248px] bg-white border-r border-[#E8E8E6] flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-[#E8E8E6] flex items-center justify-between">
          <Link href="/lab/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-black tracking-tighter">KL</span>
            </div>
            <div className="leading-none">
              <span className="block text-[15px] font-bold text-[#1A1A1A] tracking-tight">Krrishmay</span>
              <span className="block text-[11px] text-[#9B9B98] font-medium tracking-widest uppercase">Labs</span>
            </div>
          </Link>
          <button 
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B0]" />
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full bg-[#F7F7F6] border border-[#E8E8E6] rounded-lg pl-8 pr-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]/40 placeholder:text-[#B5B5B0] transition-colors"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5B5B0]">Tools</span>
          </div>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={i}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#5C5C5A] hover:bg-[#F0F0EE] hover:text-[#1A1A1A]"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#E8E8E6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              NK
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1A1A1A] leading-none truncate">Nabaraj KC</p>
              <p className="text-[11px] text-[#9B9B98] mt-0.5 truncate">Lab Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E8E8E6] flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-[#5C5C5A] hover:bg-[#F7F7F6] rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-[17px] font-semibold text-[#1A1A1A] tracking-tight truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[#9B9B98] hover:text-[#1A1A1A] hover:bg-[#F7F7F6] rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-[#9B9B98] hover:text-[#1A1A1A] hover:bg-[#F7F7F6] rounded-lg transition-colors hidden sm:block">
              <Settings style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
