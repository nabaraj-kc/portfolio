"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface Settings {
  eyebrow: string;
  headline: string;
  bio: string;
  availability: string;
  ctaLabel: string;
  ctaHref: string;
  aboutHeadline: string;
  aboutBio1: string;
  aboutBio2: string;
  statAgents: string;
  statAccuracy: string;
}

const fields: { key: keyof Settings; label: string; type: "input" | "textarea"; rows?: number }[] = [
  { key: "eyebrow", label: "Eyebrow label (above hero headline)", type: "input" },
  { key: "headline", label: "Hero headline", type: "textarea", rows: 2 },
  { key: "bio", label: "Hero bio paragraph", type: "textarea", rows: 3 },
  { key: "availability", label: "Availability text (bottom of hero)", type: "input" },
  { key: "ctaLabel", label: "CTA button label", type: "input" },
  { key: "ctaHref", label: "CTA button link URL", type: "input" },
  { key: "aboutHeadline", label: "About section headline", type: "textarea", rows: 2 },
  { key: "aboutBio1", label: "About bio paragraph 1", type: "textarea", rows: 3 },
  { key: "aboutBio2", label: "About bio paragraph 2", type: "textarea", rows: 3 },
  { key: "statAgents", label: "Stat: Agents in O System", type: "input" },
  { key: "statAccuracy", label: "Stat: KYC Accuracy", type: "input" },
];

const defaultSettings: Settings = {
  eyebrow: "", headline: "", bio: "", availability: "", ctaLabel: "", ctaHref: "",
  aboutHeadline: "", aboutBio1: "", aboutBio2: "", statAgents: "", statAccuracy: "",
};

export default function SettingsAdminPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => { 
        // Only use data if it's a settings-shaped object (not an error)
        if (data && typeof data === "object" && !data.error && !Array.isArray(data)) {
          setForm({ ...defaultSettings, ...data });
        }
        setLoading(false); 
      })
      .catch(e => {
        console.error("Failed to load settings", e);
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Settings</h1>
            <p className="text-sm text-[#8F8F8F] mt-1">Edit site-wide text content for the hero and about sections.</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[0,1,2,3,4].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <form onSubmit={save} className="space-y-5">
              {fields.map(({ key, label, type, rows }) => (
                <div key={key} className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-2">{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      rows={rows || 2}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] transition-all"
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center gap-4 pt-2 sticky bottom-0 bg-[#FAFAF8] py-4 border-t border-[#8F8F8F]/15">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {saved && (
                  <p className="text-sm text-green-600 font-mono">Saved successfully.</p>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
