"use client";

import { useEffect, useState, useRef } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";

interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tag?: string;
  author?: string;
  wordCount?: number;
  generatedBy?: string;
  requestedBy?: string;
  publishedAt?: string;
  coverImage?: string;
  type: "article" | "research";
}

interface ChatMsg { role: "user" | "assistant"; content: string; }

export default function AIContentPage() {
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [research, setResearch] = useState<ContentItem[]>([]);
  const [tab, setTab] = useState<"articles" | "research">("articles");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [cronEnabled, setCronEnabled] = useState(true);
  const [cronTime, setCronTime] = useState("08:00");
  const [cronSaving, setCronSaving] = useState(false);
  const [cronMsg, setCronMsg] = useState("");
  const [cronLastStatus, setCronLastStatus] = useState("");
  const [cronLastRun, setCronLastRun] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function refreshContent() {
    const [arts, res, cronRes] = await Promise.all([
      fetch("/api/admin/articles").then(r => r.json()).catch(() => []),
      fetch("/api/admin/research").then(r => r.json()).catch(() => []),
      fetch("/api/admin/cron").then(r => r.json()).catch(() => null),
    ]);

    const articlesList = Array.isArray(arts) ? arts : [];
    const researchList = Array.isArray(res) ? res : (res?.papers || []);

    setArticles(articlesList.map((a: any) => ({ ...a, type: "article" as const })));
    setResearch(researchList.map((r: any) => ({ ...r, type: "research" as const })));
    
    if (cronRes?.schedule) {
      setCronEnabled(cronRes.schedule.enabled);
      setCronTime(cronRes.schedule.time || "08:00");
      setCronLastStatus(cronRes.schedule.lastStatus || "");
      setCronLastRun(cronRes.schedule.lastRun || null);
    }
  }

  async function deleteItem(item: ContentItem) {
    try {
      const endpoint = item.type === "research" ? "/api/admin/research" : "/api/admin/articles";
      await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: item._id, slug: item.slug, id: item._id }),
      });
      setDeleteItemId(null);
      await refreshContent();
    } catch (e) {
      console.error("Failed to delete item:", e);
    }
  }

  async function saveCronSchedule() {
    setCronSaving(true);
    setCronMsg("");
    try {
      const res = await fetch("/api/admin/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: cronEnabled, time: cronTime }),
      });
      const data = await res.json();
      if (data.success) {
        setCronMsg("Schedule saved successfully.");
      } else {
        setCronMsg("Failed to save schedule.");
      }
    } catch {
      setCronMsg("Error updating schedule.");
    }
    setCronSaving(false);
    setTimeout(() => setCronMsg(""), 3000);
  }

  useEffect(() => {
    refreshContent().then(() => setLoading(false));

    // Poll /api/cron/publish every 30 s — safe because the route
    // has built-in idempotency (only fires once per day at the right time)
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/cron/publish", {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.executedNow) {
          setCronMsg("✅ Scheduled Daily Auto-Publishing Job Executed! 🎉");
          setCronLastStatus(data.finalStatus || "SUCCESS");
          await refreshContent();
          setTimeout(() => setCronMsg(""), 8000);
        }
      } catch (err) {
        // Silent — server may still be starting
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const items = tab === "articles" ? articles : research;
  const aiTotal = articles.length + research.length;

  async function runCronJobNow() {
    setGenerating(true);
    setGenLog([
      "Triggering daily publish job via /api/cron/publish...",
      "This bypasses the time-check and generates content immediately.",
    ]);
    try {
      // Force-execute by calling the autonomous route directly (bypasses time window)
      const res = await fetch("/api/admin/autonomous");
      const data = await res.json();
      if (data.success) {
        setGenLog(prev => [
          ...prev,
          "✅ Daily publishing complete!",
          "Article: " + (data.article?.title || "Generated"),
          "Research Paper: " + (data.research?.title || "Generated"),
        ]);
        setCronLastStatus("SUCCESS");
        await refreshContent();
      } else {
        setGenLog(prev => [...prev, "❌ Failed: " + (data.error || JSON.stringify(data))]);
      }
    } catch (e: any) {
      setGenLog(prev => [...prev, "Network error: " + e.message]);
    }
    setGenerating(false);
  }

  async function runAutonomous() {
    setGenerating(true);
    setGenLog([
      "Starting autonomous AI brain...",
      "Discovering trending topics via Tavily RAG...",
      "Deep-researching live internet sources...",
    ]);
    try {
      const res = await fetch("/api/admin/autonomous");
      const data = await res.json();
      if (data.success) {
        setGenLog(prev => [
          ...prev,
          "Article generated: " + data.article?.title,
          "Research paper generated: " + data.research?.title,
          "Both published to database.",
        ]);
        await refreshContent();
      } else {
        setGenLog(prev => [...prev, "Error: " + data.error]);
      }
    } catch {
      setGenLog(prev => [...prev, "Network error. Check console."]);
    }
    setGenerating(false);
  }

  async function sendChatCommand() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    const inputText = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    try {
      let genType: "article" | "research" | null = null;
      let genTopic = "";

      const lowerText = inputText.toLowerCase();
      const isResearchIntent = /research|paper|academic|thesis|spec|arxiv/i.test(lowerText);
      const isArticleIntent = /article|blog|post|news|essay/i.test(lowerText);

      if (isResearchIntent) {
        genType = "research";
        genTopic = inputText
          .replace(/^(?:write|create|generate|publish|a|an|the|research|paper|academic|specification|thesis|about|on|\s+)+/gi, "")
          .trim() || inputText;
      } else if (isArticleIntent) {
        genType = "article";
        genTopic = inputText
          .replace(/^(?:write|create|generate|publish|a|an|the|article|blog|post|news|essay|about|on|\s+)+/gi, "")
          .trim() || inputText;
      }

      if (genType && genTopic) {
        setChatMessages(prev => [...prev, { role: "assistant", content: `Generating ${genType} on "${genTopic}"... This may take up to a minute.` }]);
        const res = await fetch("/api/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: genType, topic: genTopic, requestedBy: "admin-command" }),
        });
        const data = await res.json();
        if (data.success) {
          const url = genType === "research" ? `/research/${data.slug}` : `/articles/${data.slug}`;
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `Generated and published.\n\n"${data.title}"\n\nWords: ~${data.wordCount} — ${url}`,
            };
            return updated;
          });
          await refreshContent();
        } else {
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: `Error: ${data.error}` };
            return updated;
          });
        }
      } else {
        // Route to real AI for any other question
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...chatMessages.map(m => ({ role: m.role === "assistant" ? "model" : "user", content: m.content })),
              { role: "user", content: inputText },
            ],
            model: "krrishmay-4o",
          }),
        });
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply || data.error || "No response." }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Failed to process. Check console." }]);
    }
    setChatLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#C85A17] mb-1">Autonomous System</p>
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">AI Content Engine</h1>
              <p className="text-sm text-[#8F8F8F] mt-1">All AI-generated articles and research papers. Command the AI to write new content.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 bg-[#5B4A8A] text-white rounded-lg text-sm font-medium hover:bg-[#4A3A79] transition-colors"
              >
                AI Command
              </button>
              <button
                onClick={runAutonomous}
                disabled={generating}
                className="px-4 py-2 bg-[#C85A17] text-white rounded-lg text-sm font-medium hover:bg-[#A64811] transition-colors disabled:opacity-50"
              >
                {generating ? "Running..." : "Run AI Now"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "AI Articles", value: articles.length, color: "bg-[#C85A17]" },
              { label: "AI Research Papers", value: research.length, color: "bg-[#4A6741]" },
              { label: "Total AI Content", value: aiTotal, color: "bg-[#202020]" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-4">
                <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">{s.label}</p>
                <p className="text-2xl font-semibold text-[#202020]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Automated Daily Publishing Schedule Card */}
          <div className="mb-6 bg-white border border-[#8F8F8F]/15 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C85A17] animate-pulse" />
                  <h2 className="text-base font-medium text-[#202020]">Automated Daily Publishing Engine</h2>
                </div>
                <p className="text-xs text-[#8F8F8F] mt-1">
                  Configure daily automated content generation and publication schedule
                  <span className="font-mono text-[#C85A17] ml-1">(Asia/Kathmandu · UTC+05:45)</span>.
                </p>
                {cronLastRun && (
                  <p className="text-[10px] font-mono text-[#8F8F8F] mt-0.5">
                    Last run: {new Date(cronLastRun).toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} NPT
                    {cronLastStatus && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] ${
                        cronLastStatus.startsWith("SUCCESS") ? "bg-green-100 text-green-700" :
                        cronLastStatus === "RUNNING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{cronLastStatus}</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs text-[#8F8F8F]">Daily Time (NPT):</label>
                  <input
                    type="time"
                    value={cronTime}
                    onChange={e => setCronTime(e.target.value)}
                    className="px-3 py-1.5 border border-[#8F8F8F]/20 rounded-lg font-mono text-xs bg-[#FAFAF8] text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs text-[#8F8F8F]">Status:</label>
                  <button
                    type="button"
                    onClick={() => setCronEnabled(!cronEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      cronEnabled ? "bg-green-600 text-white" : "bg-[#8F8F8F]/20 text-[#8F8F8F]"
                    }`}
                  >
                    {cronEnabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveCronSchedule}
                  disabled={cronSaving}
                  className="px-4 py-1.5 bg-[#202020] text-white rounded-lg font-mono text-xs hover:bg-[#C85A17] transition-colors disabled:opacity-50"
                >
                  {cronSaving ? "Saving..." : "Update Schedule"}
                </button>
                <button
                  type="button"
                  onClick={runCronJobNow}
                  disabled={generating}
                  className="px-4 py-1.5 bg-[#5B4A8A] text-white rounded-lg font-mono text-xs hover:bg-[#4A3A79] transition-colors disabled:opacity-50"
                >
                  {generating ? "Executing..." : "Run Daily Job Now (Test)"}
                </button>
              </div>
            </div>
            {cronMsg && (
              <p className={`text-xs font-mono mt-3 ${
                cronMsg.includes("✅") ? "text-green-600" : "text-[#C85A17]"
              }`}>{cronMsg}</p>
            )}
          </div>
          {genLog.length > 0 && (
            <div className="mb-6 bg-[#202020] rounded-xl p-4 font-mono text-xs text-green-400 space-y-1">
              {genLog.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          {/* AI Command Chat */}
          {showChat && (
            <div className="mb-6 bg-white border border-[#8F8F8F]/15 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#8F8F8F]/10 flex items-center gap-3">
                <h2 className="font-medium text-[#202020]">AI Command Panel</h2>
                <span className="font-mono text-[10px] text-[#8F8F8F] bg-[#8F8F8F]/10 px-2 py-0.5 rounded-full">
                  Command the AI — write articles, research papers, or ask anything
                </span>
              </div>
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-[#8F8F8F] text-sm mt-8">
                    <p className="mb-1">Command the AI to write and publish content.</p>
                    <p className="text-xs font-mono">"Write an article about agentic AI"  —  "Write a research paper on quantum ML"</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm ${msg.role === "user" ? "bg-[#C85A17] text-white" : "bg-[#F5F1E8] text-[#202020]"}`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F5F1E8] px-4 py-2.5 rounded-xl">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-[#8F8F8F]/10 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChatCommand()}
                  placeholder='Write an article about... / Write a research paper on... / Ask anything'
                  className="flex-1 px-3 py-2 bg-[#FAFAF8] border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                />
                <button
                  onClick={sendChatCommand}
                  disabled={chatLoading}
                  className="px-4 py-2 bg-[#202020] text-white rounded-lg text-sm hover:bg-[#C85A17] transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="bg-white border border-[#8F8F8F]/15 rounded-xl overflow-hidden">
            <div className="border-b border-[#8F8F8F]/10 flex">
              {(["articles", "research"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${tab === t ? "text-[#C85A17] border-b-2 border-[#C85A17] -mb-px" : "text-[#8F8F8F] hover:text-[#202020]"}`}
                >
                  {t === "articles" ? `Articles (${articles.length})` : `Research Papers (${research.length})`}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[0,1,2].map(i => <div key={i} className="h-16 bg-[#F5F1E8] rounded-lg animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[#8F8F8F] font-mono text-sm">No AI-generated {tab} yet.</p>
                <p className="text-xs text-[#8F8F8F] mt-1">Click "Run AI Now" to generate the first batch.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#8F8F8F]/10">
                {items.map(item => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors">
                    {item.coverImage && (
                      <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-[#1E1E1E] mr-3 border border-[#8F8F8F]/15">
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C85A17]/10 text-[#C85A17]">
                          {item.generatedBy === "autonomous-ai" ? "Autonomous" : "On-demand"}
                        </span>
                        {item.tag && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8F8F8F]/10 text-[#8F8F8F]">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#202020] truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-[#8F8F8F] font-mono">
                          {(item as any).formattedPublishTime || (item.publishedAt ? new Date(item.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }) : item.date)}
                        </p>
                        {item.wordCount && <p className="text-xs text-[#8F8F8F]">~{item.wordCount} words</p>}
                        {item.requestedBy && item.requestedBy !== "autonomous-ai" && (
                          <p className="text-xs text-[#8F8F8F] font-mono">by {item.requestedBy}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Link
                        href={item.type === "research" ? `/research/${item.slug}` : `/articles/${item.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 text-xs border border-[#8F8F8F]/20 rounded-lg text-[#8F8F8F] hover:text-[#C85A17] hover:border-[#C85A17] transition-colors"
                      >
                        View
                      </Link>
                      {deleteItemId === item._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteItem(item)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteItemId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteItemId(item._id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
