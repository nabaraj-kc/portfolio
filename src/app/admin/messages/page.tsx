"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetch("/api/admin/messages").then(r => r.json());
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load messages", e);
      setMessages([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    await fetch("/api/admin/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleteId(null);
    setExpanded(null);
    await load();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Messages</h1>
            <p className="text-sm text-[#8F8F8F] mt-1">Contact form submissions from your portfolio.</p>
          </div>

          {loading ? (
            <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : messages.length === 0 ? (
            <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-12 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">Inbox empty</p>
              <p className="text-sm text-[#8F8F8F]">Messages sent through your contact form will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`bg-white border rounded-xl transition-all ${msg.read ? "border-[#8F8F8F]/15" : "border-[#C85A17]/30"}`}>
                  {/* Header row */}
                  <div
                    className="p-5 flex items-start gap-4 cursor-pointer hover:bg-[#FAFAF8] rounded-xl transition-colors"
                    onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#F5F1E8] flex items-center justify-center text-xs font-semibold text-[#202020] shrink-0 uppercase">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-[#202020] text-sm">{msg.name}</p>
                        {!msg.read && <span className="w-2 h-2 bg-[#C85A17] rounded-full shrink-0" />}
                      </div>
                      <p className="font-mono text-xs text-[#8F8F8F]">{msg.email}{msg.phone ? ` · ${msg.phone}` : ""}</p>
                      <p className="text-xs text-[#8F8F8F] mt-1 line-clamp-1">{msg.message}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[10px] text-[#8F8F8F]">{formatDate(msg.receivedAt)}</p>
                      <p className="text-xs text-[#8F8F8F] mt-1">{expanded === msg.id ? "▲" : "▼"}</p>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {expanded === msg.id && (
                    <div className="px-5 pb-5 border-t border-[#8F8F8F]/10 pt-4 space-y-4">
                      <div className="bg-[#FAFAF8] rounded-lg p-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-2">Message</p>
                        <p className="text-sm text-[#202020] whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <a
                          href={`mailto:${msg.email}`}
                          className="px-4 py-2 bg-[#202020] text-[#F5F1E8] rounded-lg text-xs font-medium hover:bg-[#C85A17] transition-colors"
                        >
                          Reply via email
                        </a>
                        {deleteId === msg.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => del(msg.id)} className="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm delete</button>
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(msg.id)} className="px-4 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
