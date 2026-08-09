"use client";

import { useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

const PRESET_TOPICS = [
  "Architecting Autonomous Multi-Agent AI Workflows in 2026",
  "Why Vector Databases are Moving Beyond HNSW Indexing",
  "Building Zero-Trust Edge API Gateways with WebAssembly Runtimes",
  "How Modern Distributed Systems Handle Split-Brain Consensus Without Raft",
  "Optimizing Context Window Caching for Multi-Turn Agent Applications",
  "The Shift from Monolithic LLM Fine-Tuning to Dynamic LoRA Adapter Networks",
];

export default function AdminSocialPage() {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"linkedin" | "twitter">("linkedin");
  const [twitterFormat, setTwitterFormat] = useState<"single" | "thread">("single");
  const [toastMsg, setToastMsg] = useState("");

  const [socialData, setSocialData] = useState<{
    topic?: string;
    linkedin?: {
      headline: string;
      post: string;
      hashtags: string[];
    };
    twitter?: {
      headline: string;
      singleTweet: string;
      thread: string[];
      hashtags: string[];
    };
  } | null>(null);

  // Editable text states
  const [editableLinkedin, setEditableLinkedin] = useState("");
  const [editableSingleTweet, setEditableSingleTweet] = useState("");
  const [editableThread, setEditableThread] = useState<string[]>([]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  async function generateContent(selectedTopic?: string) {
    const targetTopic = (selectedTopic || topic).trim() || PRESET_TOPICS[0];
    setTopic(targetTopic);
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSocialData(data.data);
        if (data.data.linkedin) {
          const hashtagsStr = (data.data.linkedin.hashtags || []).join(" ");
          setEditableLinkedin(`${data.data.linkedin.post}\n\n${hashtagsStr}`);
        }
        if (data.data.twitter) {
          setEditableSingleTweet(data.data.twitter.singleTweet || "");
          setEditableThread(data.data.twitter.thread || []);
        }
        showToast("✅ Generated humanized social content!");
      } else {
        alert("Failed to generate: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error. Please check console.");
    }
    setGenerating(false);
  }

  function handleShareLinkedIn() {
    const textToShare = editableLinkedin || socialData?.linkedin?.post || "";
    if (!textToShare) return;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(textToShare)}`;
    window.open(url, "_blank");
  }

  function handleShareTwitter(tweetText?: string) {
    const textToShare = tweetText || editableSingleTweet || socialData?.twitter?.singleTweet || "";
    if (!textToShare) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
    window.open(url, "_blank");
  }

  function copyToClipboard(text: string, label: string = "Content") {
    navigator.clipboard.writeText(text);
    showToast(`📋 ${label} copied to clipboard!`);
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#C85A17] mb-1">
              AI Social Media Engine
            </p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">
              Humanized Social Content Generator
            </h1>
            <p className="text-sm text-[#8F8F8F] mt-1">
              Generate non-robotic, expert practitioner posts for LinkedIn & X (Twitter) with direct 1-click sharing.
            </p>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#202020] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg font-mono flex items-center gap-2 animate-bounce">
              {toastMsg}
            </div>
          )}

          {/* Topic Selector & Generator Control */}
          <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-sm font-semibold text-[#202020] uppercase tracking-wider mb-3">
              1. Select or Enter Topic
            </h2>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => generateContent(preset)}
                  disabled={generating}
                  className="px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#C85A17]/10 hover:text-[#C85A17] text-[#202020] rounded-lg text-xs font-mono transition-colors text-left border border-[#8F8F8F]/15 disabled:opacity-50"
                >
                  + {preset.slice(0, 45)}...
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateContent()}
                placeholder="Enter custom topic or tech concept (e.g. Multi-Agent AI Workflows, Next.js 16 Runtimes)..."
                className="flex-1 px-4 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/20 rounded-xl text-sm text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
              />
              <button
                onClick={() => generateContent()}
                disabled={generating}
                className="px-6 py-3 bg-[#C85A17] text-white rounded-xl text-sm font-medium hover:bg-[#A64811] transition-all disabled:opacity-50 shadow-sm shrink-0 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>⚡ Generate Humanized Content</>
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {socialData && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl shadow-sm overflow-hidden">
              {/* Platform Selector Tabs */}
              <div className="border-b border-[#8F8F8F]/15 bg-[#F5F1E8]/50 p-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("linkedin")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeTab === "linkedin"
                        ? "bg-[#0A66C2] text-white shadow-sm"
                        : "text-[#8F8F8F] hover:text-[#202020] hover:bg-white/60"
                    }`}
                  >
                    <span>in</span> LinkedIn Post
                  </button>
                  <button
                    onClick={() => setActiveTab("twitter")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeTab === "twitter"
                        ? "bg-[#000000] text-white shadow-sm"
                        : "text-[#8F8F8F] hover:text-[#202020] hover:bg-white/60"
                    }`}
                  >
                    <span>𝕏</span> X (Twitter) Post / Thread
                  </button>
                </div>

                {activeTab === "twitter" && (
                  <div className="flex bg-[#EFECE6] p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setTwitterFormat("single")}
                      className={`px-3 py-1 rounded-md font-mono transition-all ${
                        twitterFormat === "single" ? "bg-white text-[#202020] font-semibold shadow-xs" : "text-[#8F8F8F]"
                      }`}
                    >
                      Single Tweet
                    </button>
                    <button
                      onClick={() => setTwitterFormat("thread")}
                      className={`px-3 py-1 rounded-md font-mono transition-all ${
                        twitterFormat === "thread" ? "bg-white text-[#202020] font-semibold shadow-xs" : "text-[#8F8F8F]"
                      }`}
                    >
                      3-Tweet Thread
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content: LINKEDIN */}
              {activeTab === "linkedin" && (
                <div className="p-6">
                  {/* LinkedIn Mock Preview Card */}
                  <div className="border border-[#0A66C2]/20 rounded-xl p-5 bg-[#FAFBFD] mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#C85A17] text-white font-bold flex items-center justify-center text-sm">
                        NK
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#202020]">Nabaraj KC</h3>
                        <p className="text-xs text-[#8F8F8F]">Software & AI Engineer • Autonomous Systems Author</p>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-[#0A66C2] mb-2 font-mono">
                      Headline: {socialData.linkedin?.headline}
                    </p>

                    {/* Editable Post Body */}
                    <textarea
                      value={editableLinkedin}
                      onChange={(e) => setEditableLinkedin(e.target.value)}
                      rows={10}
                      className="w-full p-4 bg-white border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] font-sans focus:outline-none focus:ring-2 focus:ring-[#0A66C2] leading-relaxed"
                    />
                  </div>

                  {/* LinkedIn Direct Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => copyToClipboard(editableLinkedin, "LinkedIn Post")}
                      className="px-4 py-2.5 border border-[#8F8F8F]/30 rounded-xl text-xs font-mono text-[#202020] hover:bg-[#F5F1E8] transition-colors"
                    >
                      📋 Copy Text
                    </button>
                    <button
                      onClick={handleShareLinkedIn}
                      className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084E96] text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center gap-2 font-mono"
                    >
                      <span>in</span> Post on LinkedIn ↗
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content: TWITTER / X */}
              {activeTab === "twitter" && (
                <div className="p-6">
                  {twitterFormat === "single" ? (
                    <div className="border border-[#000000]/20 rounded-xl p-5 bg-[#FAFAFA] mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                          𝕏
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#202020]">Nabaraj KC (@nabarajkc)</h3>
                          <p className="text-[11px] text-[#8F8F8F]">AI Engineer & Researcher</p>
                        </div>
                      </div>

                      <textarea
                        value={editableSingleTweet}
                        onChange={(e) => setEditableSingleTweet(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-white border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] font-sans focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                      />
                      <div className="flex justify-between items-center mt-2 text-xs text-[#8F8F8F] font-mono">
                        <span>Characters: {editableSingleTweet.length} / 280</span>
                        {editableSingleTweet.length > 280 && (
                          <span className="text-red-500 font-bold">Exceeds 280 char limit</span>
                        )}
                      </div>

                      {/* Direct Single Tweet Button */}
                      <div className="flex gap-3 justify-end mt-4">
                        <button
                          onClick={() => copyToClipboard(editableSingleTweet, "Single Tweet")}
                          className="px-4 py-2 border border-[#8F8F8F]/30 rounded-xl text-xs font-mono text-[#202020] hover:bg-[#F5F1E8] transition-colors"
                        >
                          📋 Copy Tweet
                        </button>
                        <button
                          onClick={() => handleShareTwitter(editableSingleTweet)}
                          className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center gap-2 font-mono"
                        >
                          <span>𝕏</span> Post on X ↗
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Thread Format */
                    <div className="space-y-4 mb-6">
                      {editableThread.map((tweetText, idx) => (
                        <div key={idx} className="border border-[#000000]/15 rounded-xl p-4 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono font-bold text-[#C85A17]">Tweet {idx + 1} of {editableThread.length}</span>
                            <button
                              onClick={() => handleShareTwitter(tweetText)}
                              className="px-3 py-1 bg-black text-white rounded-lg text-[11px] font-mono hover:bg-gray-800 transition-colors"
                            >
                              Post Tweet {idx + 1} on X ↗
                            </button>
                          </div>
                          <textarea
                            value={tweetText}
                            onChange={(e) => {
                              const updated = [...editableThread];
                              updated[idx] = e.target.value;
                              setEditableThread(updated);
                            }}
                            rows={3}
                            className="w-full p-3 bg-[#FAFAF8] border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] font-sans focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      ))}

                      {/* Thread Copy All Button */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => copyToClipboard(editableThread.join("\n\n---\n\n"), "Full Tweet Thread")}
                          className="px-4 py-2 border border-[#8F8F8F]/30 rounded-xl text-xs font-mono text-[#202020] hover:bg-[#F5F1E8] transition-colors"
                        >
                          📋 Copy Full Thread
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
