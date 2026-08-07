"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface FocusArea {
  id: string;
  title: string;
  description: string;
  metrics: string;
}

interface Paper {
  id: string;
  title: string;
  conference: string;
  year: string;
  abstract: string;
  pdfUrl: string;
  tags: string[];
}

interface ResearchData {
  focusAreas: FocusArea[];
  papers: Paper[];
}

const emptyPaper: Paper = {
  id: "",
  title: "",
  conference: "",
  year: new Date().getFullYear().toString(),
  abstract: "",
  pdfUrl: "#",
  tags: [],
};

export default function ResearchAdminPage() {
  const [data, setData] = useState<ResearchData>({ focusAreas: [], papers: [] });
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [creatingPaper, setCreatingPaper] = useState(false);
  const [paperForm, setPaperForm] = useState<Paper>(emptyPaper);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletePaperId, setDeletePaperId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/research").then(r => r.json());
      // Safely normalize the response: ensure focusAreas and papers are always arrays
      setData({
        focusAreas: Array.isArray(res?.focusAreas) ? res.focusAreas : [],
        papers: Array.isArray(res?.papers) ? res.papers : [],
      });
    } catch (e) {
      console.error("Failed to load research", e);
      setData({ focusAreas: [], papers: [] });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreatePaper() {
    setPaperForm({ ...emptyPaper, id: Date.now().toString() });
    setTagsInput("");
    setCreatingPaper(true);
    setEditingPaper(null);
  }

  function startEditPaper(p: Paper) {
    setPaperForm(p);
    setTagsInput(p.tags.join(", "));
    setEditingPaper(p);
    setCreatingPaper(false);
  }

  function cancelPaper() {
    setCreatingPaper(false);
    setEditingPaper(null);
  }

  async function savePaper() {
    setSaving(true);
    const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const updatedPaper = { ...paperForm, tags: tagsArray };

    const method = creatingPaper ? "POST" : "PUT";
    await fetch("/api/admin/research", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPaper),
    });

    await load();
    setSaving(false);
    cancelPaper();
  }

  async function deletePaper(paper: any) {
    const targetId = paper?._id || paper?.id || paper?.slug || "";
    if (!targetId) return;
    await fetch("/api/admin/research", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: paper._id, id: paper.id, slug: paper.slug }),
    });
    setDeletePaperId(null);
    await load();
  }

  const showForm = creatingPaper || editingPaper !== null;

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#C85A17] mb-1">
                Subdomain Control ➔ research.nabarajkc.com.np
              </p>
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Research Specs &amp; Papers</h1>
            </div>
            {!showForm && (
              <button
                onClick={startCreatePaper}
                className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors"
              >
                + Add Spec Paper
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-6 mb-8">
              <h2 className="font-medium text-[#202020] mb-5">{creatingPaper ? "New Specification Paper" : "Edit Specification Paper"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Paper Title</label>
                  <input
                    type="text"
                    value={paperForm.title}
                    onChange={e => setPaperForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Conference / Institution</label>
                  <input
                    type="text"
                    value={paperForm.conference}
                    onChange={e => setPaperForm(f => ({ ...f, conference: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Year</label>
                  <input
                    type="text"
                    value={paperForm.year}
                    onChange={e => setPaperForm(f => ({ ...f, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="AI OS, Multi-Agent, System Design"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Abstract / Description</label>
                <textarea
                  rows={4}
                  value={paperForm.abstract}
                  onChange={e => setPaperForm(f => ({ ...f, abstract: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={savePaper} disabled={saving} className="px-5 py-2 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Paper"}
                </button>
                <button onClick={cancelPaper} className="px-5 py-2 border border-[#8F8F8F]/30 text-[#202020] rounded-lg text-sm font-medium hover:border-[#202020] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F]">Published Research Specs</h2>
              {data.papers.map(p => (
                <div key={p.id} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#8F8F8F]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#202020] text-base truncate">{p.title}</p>
                      <span className="font-mono text-[10px] px-2.5 py-0.5 bg-[#F5F1E8] text-[#C85A17] rounded-full shrink-0 font-semibold">{(p as any).formattedPublishTime || p.year}</span>
                    </div>
                    <p className="font-mono text-xs text-[#8F8F8F] mb-2">{p.conference}</p>
                    <p className="text-xs text-[#202020]/75 line-clamp-2 mb-3">{p.abstract}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map(t => (
                        <span key={t} className="font-mono text-[9px] bg-[#F5F1E8] px-2 py-0.5 rounded text-[#8F8F8F]">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEditPaper(p)} className="px-3 py-1.5 text-xs font-medium text-[#202020] border border-[#8F8F8F]/25 rounded-lg hover:border-[#C85A17] transition-colors">
                      Edit
                    </button>
                    {deletePaperId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deletePaper(p)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                        <button onClick={() => setDeletePaperId(null)} className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletePaperId(p.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
