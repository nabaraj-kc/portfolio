"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  content?: string;
}

const empty: Article = { slug: "", title: "", excerpt: "", date: "", readTime: "", tag: "", content: "" };

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Article>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetch("/api/admin/articles").then(r => r.json());
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load articles", e);
      setArticles([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() { setForm({ ...empty }); setCreating(true); setEditing(null); }
  function startEdit(a: Article) { setForm(a); setEditing(a); setCreating(false); }
  function cancel() { setCreating(false); setEditing(null); }

  async function save() {
    setSaving(true);
    const method = creating ? "POST" : "PUT";
    await fetch("/api/admin/articles", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await load();
    setSaving(false);
    cancel();
  }

  async function del(a: Article) {
    const targetSlug = a.slug || "";
    const targetId = (a as any)._id || "";
    if (!targetSlug && !targetId) return;

    await fetch("/api/admin/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: targetSlug, _id: targetId }),
    });
    setDeleteSlug(null);
    await load();
  }

  const showForm = creating || editing !== null;

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Articles</h1>
            </div>
            {!showForm && (
              <button onClick={startCreate} className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors">
                + New article
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-6 mb-8">
              <h2 className="font-medium text-[#202020] mb-5">{creating ? "New Article" : "Edit Article"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {([
                  { key: "slug", label: "Slug (URL)" },
                  { key: "title", label: "Title" },
                  { key: "date", label: "Date (e.g. JULY 2026)" },
                  { key: "readTime", label: "Read time (e.g. 5 min read)" },
                  { key: "tag", label: "Tag" },
                ] as const).map(({ key, label }) => (
                  <div key={key} className={key === "title" ? "sm:col-span-2" : ""}>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={form[key] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Excerpt</label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                />
              </div>
              <div className="mb-6">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Markdown Content</label>
                <textarea
                  rows={8}
                  value={form.content || ""}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full p-3 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] font-mono focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Article"}
                </button>
                <button onClick={cancel} className="px-5 py-2.5 border border-[#8F8F8F]/25 rounded-lg text-sm font-medium text-[#8F8F8F] hover:text-[#202020] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <div className="space-y-3">
              {articles.map(a => {
                const itemKey = (a as any)._id || a.slug;
                return (
                  <div key={itemKey} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#8F8F8F]/30 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[#202020] text-sm truncate">{a.title}</p>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F5F1E8] text-[#8F8F8F] rounded-full shrink-0">{a.tag}</span>
                      </div>
                      <p className="font-mono text-xs text-[#8F8F8F] mb-1">{(a as any).formattedPublishTime || a.date} · {a.readTime}</p>
                      <p className="text-xs text-[#8F8F8F] line-clamp-1">{a.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => startEdit(a)} className="px-3 py-1.5 text-xs font-medium text-[#202020] border border-[#8F8F8F]/25 rounded-lg hover:border-[#C85A17] transition-colors">
                        Edit
                      </button>
                      {deleteSlug === itemKey ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => del(a)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                          <button onClick={() => setDeleteSlug(null)} className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteSlug(itemKey)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
