"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface ExpItem {
  id: string;
  years: string;
  role: string;
  organization: string;
  description: string;
  tag: string;
  initials: string;
}

const empty: ExpItem = { id: "", years: "", role: "", organization: "", description: "", tag: "", initials: "" };

export default function ExperienceAdminPage() {
  const [items, setItems] = useState<ExpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExpItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ExpItem>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetch("/api/admin/experience").then(r => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load experience", e);
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() { setForm({ ...empty, id: Date.now().toString() }); setCreating(true); setEditing(null); }
  function startEdit(e: ExpItem) { setForm(e); setEditing(e); setCreating(false); }
  function cancel() { setCreating(false); setEditing(null); }

  async function save() {
    setSaving(true);
    const method = creating ? "POST" : "PUT";
    await fetch("/api/admin/experience", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await load();
    setSaving(false);
    cancel();
  }

  async function del(id: string) {
    await fetch("/api/admin/experience", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleteId(null);
    await load();
  }

  const showForm = creating || editing !== null;
  const fields: { key: keyof ExpItem; label: string }[] = [
    { key: "role", label: "Role / Position" },
    { key: "organization", label: "Organization" },
    { key: "years", label: "Years (e.g. 2024 – PRESENT)" },
    { key: "tag", label: "Tag" },
    { key: "initials", label: "Initials (2 chars)" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
              <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Experience</h1>
            </div>
            {!showForm && (
              <button onClick={startCreate} className="px-5 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors">
                + Add entry
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white border border-[#8F8F8F]/20 rounded-xl p-6 mb-8">
              <h2 className="font-medium text-[#202020] mb-5">{creating ? "New Experience Entry" : "Edit Entry"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {fields.map(({ key, label }) => (
                  <div key={key}>
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
              <div className="mb-5">
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
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={cancel} className="px-5 py-2 border border-[#8F8F8F]/30 text-[#202020] rounded-lg text-sm font-medium hover:border-[#202020] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-[#8F8F8F]/30 transition-all">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F1E8] flex items-center justify-center text-xs font-mono font-semibold text-[#202020] shrink-0">
                      {item.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-[#202020] text-sm">{item.role}</p>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F5F1E8] text-[#8F8F8F] rounded-full shrink-0">{item.tag}</span>
                      </div>
                      <p className="font-mono text-xs text-[#8F8F8F] mb-1">{item.organization} · {item.years}</p>
                      <p className="text-xs text-[#8F8F8F] line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(item)} className="px-3 py-1.5 text-xs font-medium text-[#202020] border border-[#8F8F8F]/25 rounded-lg hover:border-[#C85A17] transition-colors">Edit</button>
                    {deleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => del(item.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg">Confirm</button>
                        <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-xs font-medium text-[#8F8F8F] border border-[#8F8F8F]/25 rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)} className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
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
