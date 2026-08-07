"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  registeredAt?: string;
  lastLoginAt?: string;
  commentsCount: number;
  likesCount: number;
  chatsCount: number;
  viewsCount: number;
  recentActivity: Array<{ type: string; text: string; date: string }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    google: users.filter(u => u.provider === "google").length,
    email: users.filter(u => u.provider === "email").length,
    totalComments: users.reduce((s, u) => s + u.commentsCount, 0),
    totalChats: users.reduce((s, u) => s + u.chatsCount, 0),
  };

  const activityLabel = (type: string) => {
    if (type === "comment") return "cmnt";
    if (type === "like") return "like";
    if (type === "chat") return "chat";
    return "view";
  };

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Users & Activities</h1>
            <p className="text-sm text-[#8F8F8F] mt-1">All registered users and their engagement across the site.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.total, color: "bg-[#202020]" },
              { label: "Google Auth", value: stats.google, color: "bg-[#4285F4]" },
              { label: "Email Auth", value: stats.email, color: "bg-[#C85A17]" },
              { label: "Total Comments", value: stats.totalComments, color: "bg-[#4A6741]" },
              { label: "Total Chats", value: stats.totalChats, color: "bg-[#5B4A8A]" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-4">
                <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">{s.label}</p>
                <p className="text-2xl font-semibold text-[#202020]">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* User List */}
            <div className="flex-1 bg-white border border-[#8F8F8F]/15 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#8F8F8F]/10 flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 px-3 py-2 bg-[#FAFAF8] border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                />
              </div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[0,1,2,3].map(i => <div key={i} className="h-16 bg-[#F5F1E8] rounded-lg animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-[#8F8F8F] font-mono text-sm">No users found.</div>
              ) : (
                <div className="divide-y divide-[#8F8F8F]/10">
                  {filtered.map(user => (
                    <div
                      key={user._id}
                      onClick={() => setSelected(user)}
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-[#F5F1E8] transition-colors ${selected?._id === user._id ? "bg-[#F5F1E8] border-l-2 border-[#C85A17]" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#202020] flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-medium">{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#202020] truncate">{user.name || "Anonymous"}</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${user.provider === "google" ? "bg-[#4285F4]/10 text-[#4285F4]" : "bg-[#C85A17]/10 text-[#C85A17]"}`}>
                            {user.provider}
                          </span>
                        </div>
                        <p className="text-xs text-[#8F8F8F] truncate">{user.email}</p>
                      </div>
                      <div className="flex gap-3 shrink-0 text-right">
                        <div className="text-center">
                          <p className="text-xs font-semibold text-[#202020]">{user.commentsCount}</p>
                          <p className="text-[9px] text-[#8F8F8F] font-mono">cmts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-[#202020]">{user.chatsCount}</p>
                          <p className="text-[9px] text-[#8F8F8F] font-mono">chats</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Panel */}
            {selected && (
              <div className="w-72 shrink-0 bg-white border border-[#8F8F8F]/15 rounded-xl p-5 h-fit sticky top-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#8F8F8F]/10">
                  <div className="w-12 h-12 rounded-full bg-[#202020] flex items-center justify-center overflow-hidden">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">{selected.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#202020]">{selected.name}</p>
                    <p className="text-xs text-[#8F8F8F] font-mono">{selected.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { label: "Comments", value: selected.commentsCount },
                    { label: "Likes", value: selected.likesCount },
                    { label: "Chats", value: selected.chatsCount },
                    { label: "Views", value: selected.viewsCount },
                  ].map(s => (
                    <div key={s.label} className="bg-[#FAFAF8] rounded-lg p-2.5 text-center">
                      <p className="text-xl font-semibold text-[#202020]">{s.value}</p>
                      <p className="text-[10px] font-mono text-[#8F8F8F] uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-3">Recent Activity</p>
                  {selected.recentActivity.length === 0 ? (
                    <p className="text-xs text-[#8F8F8F]">No activity yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.recentActivity.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#8F8F8F]/10 text-[#8F8F8F] rounded">
                            {activityLabel(a.type)}
                          </span>
                          <div>
                            <p className="text-[#202020] line-clamp-2">{a.text}</p>
                            <p className="text-[10px] text-[#8F8F8F] font-mono mt-0.5">
                              {a.date ? new Date(a.date).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-[#8F8F8F]/10">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1">Provider</p>
                  <span className={`text-xs font-mono px-2 py-1 rounded-full ${selected.provider === "google" ? "bg-[#4285F4]/10 text-[#4285F4]" : "bg-[#C85A17]/10 text-[#C85A17]"}`}>
                    {selected.provider === "google" ? "Google OAuth" : "Email / Password"}
                  </span>
                  {selected.registeredAt && (
                    <p className="text-xs text-[#8F8F8F] mt-2">
                      Registered: {new Date(selected.registeredAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
