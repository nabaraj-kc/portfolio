"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";

interface Stats {
  projects: number;
  articles: number;
  experience: number;
  messages: number;
  unread: number;
  aiContent: number;
  users: number;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ projects: 0, articles: 0, experience: 0, messages: 0, unread: 0, aiContent: 0, users: 0 });
  const [recent, setRecent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [projects, articles, experience, messages, research, users] = await Promise.all([
        fetch("/api/admin/projects").then(r => r.json()).catch(() => []),
        fetch("/api/admin/articles").then(r => r.json()).catch(() => []),
        fetch("/api/admin/experience").then(r => r.json()).catch(() => []),
        fetch("/api/admin/messages").then(r => r.json()).catch(() => []),
        fetch("/api/admin/research").then(r => r.json()).catch(() => []),
        fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      ]);

      const safeArts = Array.isArray(articles) ? articles : [];
      const safeRes = Array.isArray(research) ? research : [];
      const safeUsers = Array.isArray(users) ? users : [];

      const aiArts = safeArts.filter((a: any) => a.generatedBy?.includes("ai") || a.generatedBy?.includes("autonomous") || a.generatedBy?.includes("demand"));
      const aiRes = safeRes.filter((r: any) => r.generatedBy?.includes("ai") || r.generatedBy?.includes("autonomous") || r.generatedBy?.includes("demand"));
      const totalAi = aiArts.length + aiRes.length > 0 ? aiArts.length + aiRes.length : safeArts.length + safeRes.length;

      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        articles: safeArts.length,
        experience: Array.isArray(experience) ? experience.length : 0,
        messages: Array.isArray(messages) ? messages.length : 0,
        unread: Array.isArray(messages) ? messages.filter((m: Message) => !m.read).length : 0,
        aiContent: totalAi,
        users: safeUsers.length,
      });
      if (Array.isArray(messages)) setRecent(messages.slice(0, 3));
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Projects", value: stats.projects, href: "/admin/projects", color: "bg-[#202020]" },
    { label: "Articles", value: stats.articles, href: "/admin/articles", color: "bg-[#C85A17]" },
    { label: "Experience", value: stats.experience, href: "/admin/experience", color: "bg-[#4A6741]" },
    { label: "Messages", value: stats.messages, href: "/admin/messages", color: "bg-[#5B4A8A]", badge: stats.unread },
    { label: "AI Content", value: stats.aiContent, href: "/admin/ai-content", color: "bg-green-600" },
    { label: "Users", value: stats.users, href: "/admin/users", color: "bg-[#4285F4]" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin Panel</p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Dashboard</h1>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="h-28 bg-[#F5F1E8] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {cards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group relative bg-white border border-[#8F8F8F]/15 rounded-xl p-5 hover:border-[#C85A17]/30 hover:shadow-sm transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${card.color} mb-3`} />
                  <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">{card.label}</p>
                  <p className="text-3xl font-medium text-[#202020]">{card.value}</p>
                  {card.badge && card.badge > 0 ? (
                    <span className="absolute top-4 right-4 bg-[#C85A17] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                      {card.badge} new
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-6">
              <h2 className="font-medium text-[#202020] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Add new project", href: "/admin/projects" },
                  { label: "Write new article", href: "/admin/articles" },
                  { label: "Run AI Content Engine", href: "/admin/ai-content" },
                  { label: "View Users & Activity", href: "/admin/users" },
                  { label: "Manage API Keys", href: "/admin/apikeys" },
                  { label: "View messages", href: "/admin/messages" },
                ].map(a => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1E8] transition-colors group"
                  >
                    <span className="text-sm text-[#202020]">{a.label}</span>
                    <span className="text-[#8F8F8F] group-hover:text-[#C85A17] transition-colors text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-[#202020]">Recent Messages</h2>
                <Link href="/admin/messages" className="font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors">View all →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[0,1,2].map(i => <div key={i} className="h-12 bg-[#F5F1E8] rounded-lg animate-pulse" />)}
                </div>
              ) : recent.length === 0 ? (
                <p className="text-sm text-[#8F8F8F] font-mono">No messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-[#FAFAF8] border border-[#8F8F8F]/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#202020]">{msg.name}</p>
                        {!msg.read && <span className="w-2 h-2 bg-[#C85A17] rounded-full" />}
                      </div>
                      <p className="text-xs text-[#8F8F8F] truncate">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between border-t border-[#8F8F8F]/15 pt-6">
            <p className="font-mono text-xs text-[#8F8F8F]">nabarajkc.com.np admin panel</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors">
              View public site ↗
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
