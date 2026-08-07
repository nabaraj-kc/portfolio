"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Copy, Send, Check } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface SocialActionsProps {
  id: string; // unique ID for comments/likes tracking
  title: string;
  copyText: string; // content to copy (like abstract or full article text)
}

export default function SocialActions({ id, title, copyText }: SocialActionsProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  // Read user session from cookie
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
        const userData = JSON.parse(decodeURIComponent(session));
        setUser(userData);
        setAuthorName(userData.username);
      } catch (e) {
        console.error("Failed to parse user session cookie:", e);
      }
    }
  }, []);

  // Fetch comments and likes from MongoDB APIs on mount
  useEffect(() => {
    const fetchLikesAndComments = async () => {
      try {
        // Fetch Comments
        const commentsRes = await fetch(`/api/comments?pageId=${encodeURIComponent(id)}`);
        const commentsData = await commentsRes.json();
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        }

        // Fetch Likes
        const emailParam = user ? `&email=${encodeURIComponent(user.email)}` : "";
        const likesRes = await fetch(`/api/likes?pageId=${encodeURIComponent(id)}${emailParam}`);
        const likesData = await likesRes.json();
        if (likesData && typeof likesData.count === "number") {
          setLikes(likesData.count);
          setHasLiked(!!likesData.hasLiked);
        }
      } catch (err) {
        console.error("Failed to sync comments/likes with DB:", err);
      }
    };

    fetchLikesAndComments();
  }, [id, user]);

  const handleLike = async () => {
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: id,
          email: user?.email || null,
        }),
      });
      const data = await res.json();
      if (data && typeof data.count === "number") {
        setLikes(data.count);
        setHasLiked(!!data.hasLiked);
      }

      // Track behaviour
      await fetch("/api/behaviour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: hasLiked ? "unlike" : "like",
          pageId: id,
          title: title,
          email: user?.email || "anonymous",
        }),
      });
    } catch (err) {
      console.error("Like toggle failed:", err);
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track behaviour
    await fetch("/api/behaviour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "copy_abstract",
        pageId: id,
        title: title,
        email: user?.email || "anonymous",
      }),
    });
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);

      // Track behaviour
      await fetch("/api/behaviour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "share_link",
          pageId: id,
          title: title,
          email: user?.email || "anonymous",
        }),
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = authorName.trim() || "Anonymous Reader";

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: id,
          author,
          text: commentText.trim(),
        }),
      });

      if (res.ok) {
        // Refresh comments list from DB
        const commentsRes = await fetch(`/api/comments?pageId=${encodeURIComponent(id)}`);
        const commentsData = await commentsRes.json();
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        }

        setCommentText("");
        if (!user) {
          setAuthorName("");
        }

        // Track behaviour
        await fetch("/api/behaviour", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "add_comment",
            pageId: id,
            title: title,
            email: user?.email || "anonymous",
            details: { author, text: commentText.trim() },
          }),
        });
      }
    } catch (err) {
      console.error("Comment submission failed:", err);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#8F8F8F]/20 space-y-12">
      {/* Share / Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#8F8F8F]/10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
              hasLiked
                ? "bg-[#C85A17]/10 border-[#C85A17]/30 text-[#C85A17] scale-105"
                : "border-[#8F8F8F]/20 text-[#202020]/75 hover:border-[#C85A17]/40 hover:text-[#C85A17]"
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${hasLiked ? "fill-[#C85A17]" : ""}`} />
            <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#8F8F8F]/20 text-[#202020]/75 hover:border-[#C85A17]/40 hover:text-[#C85A17] transition-all text-xs font-mono"
            title="Copy content text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Abstract"}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#8F8F8F]/20 text-[#202020]/75 hover:border-[#C85A17]/40 hover:text-[#C85A17] transition-all text-xs font-mono"
            title="Copy share link"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shared ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#202020] tracking-tight">
          Comments ({comments.length})
        </h3>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3.5 py-2 text-sm border border-[#8F8F8F]/25 bg-white text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/60"
              disabled={!!user}
            />
          </div>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Join the discussion..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-[#8F8F8F]/25 bg-white text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all resize-none placeholder:text-[#8F8F8F]/60"
              required
            />
            <button
              type="submit"
              className="absolute right-3 bottom-3 p-1.5 rounded-md bg-[#202020] text-[#F5F1E8] hover:bg-[#C85A17] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div className="space-y-4 pt-4 border-t border-[#8F8F8F]/10">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl border border-[#8F8F8F]/15 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#202020]">{comment.author}</span>
                <span className="font-mono text-[#8F8F8F]">{comment.date}</span>
              </div>
              <p className="text-sm text-[#202020]/80 leading-relaxed">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
