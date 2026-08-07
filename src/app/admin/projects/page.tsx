"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tag: string;
  language: string;
  href: string;
  featured?: boolean;
}

const empty: Project = { id: "", title: "", category: "", description: "", tag: "", language: "", href: "", featured: false };

const fields: { key: keyof Omit<Project, "id" | "description" | "featured">; label: string; placeholder: string }[] = [
  { key: "title", label: "Project Title", placeholder: "e.g. CardioRisk AI" },
  { key: "category", label: "Category", placeholder: "e.g. Machine Learning" },
  { key: "tag", label: "Tag / Technologies", placeholder: "e.g. PyTorch / Docker" },
  { key: "language", label: "Primary Language", placeholder: "e.g. Python" },
  { key: "href", label: "Project Link (URL)", placeholder: "e.g. https://github.com/..." },
];

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Project>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetch("/api/admin/projects").then(r => r.json());
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load projects", e);
      setProjects([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() { setForm({ ...empty, id: Date.now().toString() }); setCreating(true); setEditing(null); }
  function startEdit(p: Project) { setForm(p); setEditing(p); setCreating(false); }
  function cancel() { setCreating(false); setEditing(null); }

  async function save() {
    setSaving(true);
    const method = creating ? "POST" : "PUT";
    await fetch("/api/admin/projects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await load();
    setSaving(false);
    cancel();
  }

  async function del(id: string) {
    await fetch("/api/admin/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleteId(null);
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
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Projects</h1>
            </div>
            {!showForm && (
              <button onClick={startCreate} className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors">
                + Add project
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-6 mb-8">
              <h2 className="font-medium text-[#202020] mb-5">{creating ? "New Project" : "Edit Project"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {fields.map(({ key, label, placeholder }) => (
                  <div key={key} className={key === "title" ? "sm:col-span-2" : ""}>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={form[key] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/25 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={!!form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-[#C85A17]"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-[#202020]">Featured project (highlighted on homepage)</label>
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
              <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Project"}
                </button>
                <button onClick={cancel} className="px-5 py-2 border border-[#8F8F8F]/30 text-[#202020] rounded-lg text-sm font-medium hover:border-[#202020] transition-colors">
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
              {projects.map(p => (
                <div key={p.id} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#8F8F8F]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#202020] text-sm truncate">{p.title}</p>
                      {p.featured && <span className="font-mono text-[10px] px-2 py-0.5 bg-[#C85A17]/10 text-[#C85A17] rounded-full shrink-0">Featured</span>}
                    </div>
                    <p className="font-mono text-xs text-[#8F8F8F] mb-1">{p.category} · {p.tag}</p>
                    <p className="text-xs text-[#8F8F8F] line-clamp-1">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(p)} className="px-3 py-1.5 text-xs font-medium text-[#202020] border border-[#8F8F8F]/25 rounded-lg hover:border-[#C85A17] transition-colors">
                      Edit
                    </button>
                    {deleteId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => del(p.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                        <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(p.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
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
