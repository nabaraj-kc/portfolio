"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface LabProject {
  id: string;
  name: string;
  category: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  snippet: string;
}

const emptyItem: LabProject = {
  id: "",
  name: "",
  category: "",
  description: "",
  techStack: [],
  githubUrl: "https://github.com/nabaraj-kc",
  snippet: "",
};

export default function LabAdminPage() {
  const [items, setItems] = useState<LabProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<LabProject | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [form, setForm] = useState<LabProject>(emptyItem);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetch("/api/admin/lab").then(r => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load lab", e);
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() {
    setForm({ ...emptyItem, id: Date.now().toString() });
    setTechInput("");
    setCreatingItem(true);
    setEditingItem(null);
  }

  function startEdit(item: LabProject) {
    setForm(item);
    setTechInput(item.techStack.join(", "));
    setEditingItem(item);
    setCreatingItem(false);
  }

  function cancel() {
    setCreatingItem(false);
    setEditingItem(null);
  }

  async function save() {
    setSaving(true);
    const techArray = techInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...form, techStack: techArray };

    const method = creatingItem ? "POST" : "PUT";
    await fetch("/api/admin/lab", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await load();
    setSaving(false);
    cancel();
  }

  async function del(id: string) {
    await fetch("/api/admin/lab", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteId(null);
    await load();
  }

  const showForm = creatingItem || editingItem !== null;

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#C85A17] mb-1">
                Subdomain Control ➔ labs.nabarajkc.com.np
              </p>
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Lab Prototypes &amp; Code Snippets</h1>
            </div>
            {!showForm && (
              <button
                onClick={startCreate}
                className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors"
              >
                + Add Lab Prototype
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-6 mb-8">
              <h2 className="font-medium text-[#202020] mb-5">{creatingItem ? "New Lab Prototype" : "Edit Prototype"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Prototype Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">GitHub Repository Link</label>
                  <input
                    type="text"
                    value={form.githubUrl}
                    onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Python, PyTorch, C++"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all resize-none"
                />
              </div>
              <div className="mb-5">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Code Snippet (C++ / Python / JS)</label>
                <textarea
                  rows={6}
                  value={form.snippet}
                  onChange={e => setForm(f => ({ ...f, snippet: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-xs text-[#F5F1E8] bg-[#1A1A1A] font-mono focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Prototype"}
                </button>
                <button onClick={cancel} className="px-5 py-2 border border-[#8F8F8F]/30 text-[#202020] rounded-lg text-sm font-medium hover:border-[#202020] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#8F8F8F]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#202020] text-base truncate">{item.name}</p>
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F5F1E8] text-[#8F8F8F] rounded-full shrink-0">{item.category}</span>
                    </div>
                    <p className="text-xs text-[#8F8F8F] line-clamp-1 mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.techStack.map(tech => (
                        <span key={tech} className="font-mono text-[9px] bg-[#F5F1E8] px-2 py-0.5 rounded text-[#202020]/80 border border-[#8F8F8F]/15">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(item)} className="px-3 py-1.5 text-xs font-medium text-[#202020] border border-[#8F8F8F]/25 rounded-lg hover:border-[#C85A17] transition-colors">
                      Edit
                    </button>
                    {deleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => del(item.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                        <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
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
