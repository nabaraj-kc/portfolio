"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const mainNavItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/articles", label: "Articles (Blog)" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Site Settings" },
];

const subdomainNavItems = [
  { href: "/admin/research", label: "Research Spec", badge: "research." },
  { href: "/admin/lab", label: "Lab Snippets", badge: "labs." },
  { href: "/admin/ai-config", label: "Krrishmay AI", badge: "krrishmay." },
];

const aiNavItems = [
  { href: "/admin/ai-content", label: "AI Content Engine" },
  { href: "/admin/social", label: "Social Media Engine" },
  { href: "/admin/users", label: "Users & Activities" },
  { href: "/admin/apikeys", label: "API Keys Manager" },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <aside className="w-64 min-h-screen bg-[#202020] text-[#F5F1E8] flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-10 w-32">
            <Image
              src="/images/logo-transparent.png"
              alt="Nabaraj KC"
              fill
              className="object-contain object-left invert"
              unoptimized
            />
          </div>
        </Link>
        <p className="mt-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Central Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div>
          <p className="px-3 font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2 font-semibold">
            Main Site
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[#C85A17] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={`text-[6px] ${active ? "text-white" : "text-[#C85A17]"}`}>■</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Subdomains Section */}
        <div>
          <p className="px-3 font-mono text-[9px] uppercase tracking-widest text-[#C85A17] mb-2 font-semibold flex items-center justify-between">
            <span>Subdomain Control</span>
            <span className="text-[8px] bg-[#C85A17]/20 text-[#C85A17] px-1.5 py-0.5 rounded">Multi</span>
          </p>
          <div className="space-y-1">
            {subdomainNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[#C85A17] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[6px] ${active ? "text-white" : "text-[#C85A17]"}`}>■</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-[9px] opacity-50">{item.badge}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI System Section */}
        <div>
          <p className="px-3 font-mono text-[9px] uppercase tracking-widest text-green-400 mb-2 font-semibold">
            AI System
          </p>
          <div className="space-y-1">
            {aiNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-green-600 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={`text-[6px] ${active ? "text-white" : "text-green-400"}`}>■</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* View Site + Logout */}
      <div className="px-4 pb-6 space-y-2 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all font-mono"
        >
          <span className="text-xs">↗</span> View public site
        </a>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all font-mono text-left"
        >
          <span className="text-xs">→</span> {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </aside>
  );
}
