"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { User, Mail, Calendar, MessageSquare, Heart, MessageCircle, Edit3, Save, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UserActivity {
  comments: Array<{ id: string; pageId: string; text: string; createdAt: string }>;
  likes: Array<{ pageId: string; createdAt: string }>;
  chats: Array<{ id: string; title: string; updatedAt: string }>;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ username: string; email: string; picture?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [activity, setActivity] = useState<UserActivity>({ comments: [], likes: [], chats: [] });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Retrieve user session on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    const session = getCookie("user_session");
    if (session) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(session));
        setUser(parsedUser);
        setNewUsername(parsedUser.username);
      } catch (e) {
        console.error("Failed to parse user session cookie:", e);
      }
    }
  }, []);

  // Fetch activity logs once authenticated
  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setActivity(data);
        }
      } catch (e) {
        console.error("Failed to load user activity:", e);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, picture: user?.picture }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setMessage("Username updated successfully!");
        setUser(data.user);
        setIsEditing(false);
        // Refresh page to sync changes with Nav
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  const getPageTitle = (pageId: string) => {
    // Format slug/id into a human-readable title
    return pageId
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getPageLink = (pageId: string) => {
    // Route pageId based on research vs. articles
    if (pageId.match(/^(attention|nepali|image|sentiment)/i)) {
      return `https://lab.nabarajkc.com.np/lab/${pageId}`;
    }
    const isResearchPaper = ["agentic-design", "cardiac-risk", "financial-lstm", "multi-agent-os"].includes(pageId);
    if (isResearchPaper) {
      return `https://research.nabarajkc.com.np/research/${pageId}`;
    }
    return `https://nabarajkc.com.np/articles/${pageId}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
        <Nav />
        <main className="flex-grow pt-32 pb-24 flex flex-col items-center justify-center px-6">
          <ScrollReveal>
            <div className="bg-[#FFFFFF] border border-[#8F8F8F]/25 rounded-2xl p-8 max-w-sm text-center space-y-4 shadow-whisper">
              <User className="w-12 h-12 text-[#C85A17] mx-auto opacity-50" />
              <h2 className="text-xl font-medium">Access Restricted</h2>
              <p className="text-xs text-[#8F8F8F]">
                Please sign in to view and manage your profile activity logs.
              </p>
              <Link
                href="/auth"
                className="inline-block w-full py-2.5 rounded-lg bg-[#202020] hover:bg-[#C85A17] text-[#F5F1E8] text-xs font-mono font-bold tracking-wider uppercase transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          </ScrollReveal>
        </main>
        <FooterCTA />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
      <Nav />

      <main className="flex-grow pt-32 pb-24 md:pt-40 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Card */}
        <div className="lg:col-span-1 space-y-6">
          <ScrollReveal>
            <div className="bg-[#FFFFFF] border border-[#8F8F8F]/25 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Profile Pic & Identity */}
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.username} 
                      className="w-24 h-24 rounded-full object-cover border border-[#8F8F8F]/20 mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#C85A17]/10 flex items-center justify-center text-[#C85A17] mx-auto border border-[#C85A17]/20">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-[#8F8F8F]/30 bg-[#FAFAF8] text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all"
                        required
                        disabled={saving}
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="p-2 bg-[#202020] hover:bg-[#C85A17] text-white rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight text-[#202020]">{user.username}</h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-[#8F8F8F] hover:text-[#C85A17] transition-colors cursor-pointer"
                        title="Edit username"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs font-mono text-[#8F8F8F]">{user.email}</p>
                </div>
              </div>

              {/* Status Alert Messages */}
              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs px-3 py-2 rounded-lg text-center font-mono">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-700 text-xs px-3 py-2 rounded-lg text-center font-mono">
                  {error}
                </div>
              )}

              {/* Metadata Details */}
              <div className="border-t border-[#8F8F8F]/10 pt-6 space-y-4 text-xs font-mono text-[#202020]/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8F8F8F] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8F8F8F] shrink-0" />
                  <span>Joined recently</span>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Activity details */}
        <div className="lg:col-span-2 space-y-8">
          <ScrollReveal delay={100}>
            <div className="bg-[#FFFFFF] border border-[#8F8F8F]/25 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#8F8F8F]/10 pb-4">
                <h3 className="text-lg font-medium tracking-tight">Your Activity Log</h3>
                <span className="text-xs font-mono text-[#8F8F8F] uppercase tracking-wider font-bold">
                  MongoDB Verified
                </span>
              </div>

              {loadingActivity ? (
                <div className="py-12 text-center text-[#8F8F8F] flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-mono text-xs">Loading activity metrics...</span>
                </div>
              ) : (
                <div className="space-y-8">

                  {/* Likes log */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C85A17] uppercase tracking-widest">
                      <Heart className="w-4 h-4 fill-[#C85A17]" />
                      <span>Reactions &amp; Likes ({activity.likes.length})</span>
                    </div>
                    {activity.likes.length === 0 ? (
                      <p className="text-xs text-[#8F8F8F] italic pl-6">No liked articles or papers found.</p>
                    ) : (
                      <div className="space-y-2 pl-6">
                        {activity.likes.map((like, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#8F8F8F]/5">
                            <a
                              href={getPageLink(like.pageId)}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[#202020] hover:text-[#C85A17] hover:underline flex items-center gap-1.5"
                            >
                              <span>{getPageTitle(like.pageId)}</span>
                              <ArrowRight className="w-3 h-3 text-[#8F8F8F]" />
                            </a>
                            <span className="text-[10px] font-mono text-[#8F8F8F]">{like.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments log */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C85A17] uppercase tracking-widest">
                      <MessageCircle className="w-4 h-4" />
                      <span>Submitted Comments ({activity.comments.length})</span>
                    </div>
                    {activity.comments.length === 0 ? (
                      <p className="text-xs text-[#8F8F8F] italic pl-6">No comments submitted yet.</p>
                    ) : (
                      <div className="space-y-3 pl-6">
                        {activity.comments.map((comment) => (
                          <div key={comment.id} className="text-xs py-2 border-b border-[#8F8F8F]/5 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono text-[#8F8F8F]">
                              <a href={getPageLink(comment.pageId)} target="_blank" rel="noreferrer" className="hover:underline hover:text-[#C85A17]">
                                on {getPageTitle(comment.pageId)}
                              </a>
                              <span>{comment.createdAt}</span>
                            </div>
                            <p className="text-[#202020]/80 italic bg-[#FAFAF8] p-2 rounded-lg border border-[#8F8F8F]/10">
                              &ldquo;{comment.text}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Krrishmay Chats log */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C85A17] uppercase tracking-widest">
                      <MessageSquare className="w-4 h-4" />
                      <span>Saved Chatbot Sessions ({activity.chats.length})</span>
                    </div>
                    {activity.chats.length === 0 ? (
                      <p className="text-xs text-[#8F8F8F] italic pl-6">No chatbot sessions recorded.</p>
                    ) : (
                      <div className="space-y-2 pl-6">
                        {activity.chats.map((chat) => (
                          <div key={chat.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#8F8F8F]/5">
                            <a
                              href={`https://krrishmay.nabarajkc.com.np?chatId=${chat.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[#202020] hover:text-[#C85A17] hover:underline flex items-center gap-1.5"
                            >
                              <span>{chat.title}</span>
                              <ArrowRight className="w-3 h-3 text-[#8F8F8F]" />
                            </a>
                            <span className="text-[10px] font-mono text-[#8F8F8F]">{chat.updatedAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </ScrollReveal>
        </div>

      </main>

      <FooterCTA />
    </div>
  );
}
