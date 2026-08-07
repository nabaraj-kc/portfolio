"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface ApiKey {
  _id: string;
  name: string;
  label: string;
  maskedValue: string;
  updatedAt?: string;
}

const COMMON_KEYS = [
  { name: "GEMINI_API_KEY", label: "Gemini API Key (Google AI)" },
  { name: "MISTRAL_API_KEY", label: "Mistral AI API Key" },
  { name: "TAVILY_API_KEY", label: "Tavily Search API Key (RAG)" },
  { name: "OPENROUTER_API_KEY", label: "OpenRouter API Key" },
  { name: "CLOUDFLARE_API_TOKEN", label: "Cloudflare API Token (TTS)" },
  { name: "CRON_SECRET", label: "Cron Job Secret (GitHub Actions)" },
];

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", label: "", value: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showValue, setShowValue] = useState<string | null>(null);

  async function fetchKeys() {
    const data = await fetch("/api/admin/apikeys").then(r => r.json());
    setKeys(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchKeys(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.value) { setMessage("Name and value are required."); return; }
    setSaving(true);
    const res = await fetch("/api/admin/apikeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.success ? "✅ API key saved successfully." : "❌ " + data.error);
    setSaving(false);
    setForm({ name: "", label: "", value: "" });
    fetchKeys();
    setTimeout(() => setMessage(""), 4000);
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete API key "${name}"? It will fall back to the .env.local value if present.`)) return;
    await fetch("/api/admin/apikeys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchKeys();
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-1">Admin</p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">API Keys Manager</h1>
            <p className="text-sm text-[#8F8F8F] mt-1">Securely manage API keys stored in MongoDB. Values are masked in the UI. Keys stored here override .env.local values at runtime.</p>
          </div>

          {/* Add / Update Key Form */}
          <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-[#202020] mb-4">Add or Update Key</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Key Name (env var)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))}
                      placeholder="GEMINI_API_KEY"
                      className="flex-1 px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Display Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Gemini AI API Key"
                    className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">API Key Value</label>
                <input
                  type="password"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder="Paste your API key here..."
                  className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] font-mono"
                />
              </div>
              {/* Quick presets */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-2">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_KEYS.map(k => (
                    <button
                      key={k.name}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, name: k.name, label: k.label }))}
                      className="text-xs px-2 py-1 rounded-lg bg-[#F5F1E8] text-[#8F8F8F] hover:text-[#C85A17] hover:bg-[#C85A17]/10 transition-colors font-mono"
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              </div>
              {message && <p className="text-sm font-mono text-green-600">{message}</p>}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save API Key"}
              </button>
            </form>
          </div>

          {/* Stored Keys */}
          <div className="bg-white border border-[#8F8F8F]/15 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#8F8F8F]/10">
              <h2 className="font-medium text-[#202020]">Stored Keys ({keys.length})</h2>
              <p className="text-xs text-[#8F8F8F] mt-0.5">Keys stored here override environment variables at runtime.</p>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">{[0,1,2].map(i => <div key={i} className="h-12 bg-[#F5F1E8] rounded-lg animate-pulse" />)}</div>
            ) : keys.length === 0 ? (
              <div className="p-8 text-center text-[#8F8F8F] font-mono text-sm">No API keys stored in DB yet.</div>
            ) : (
              <div className="divide-y divide-[#8F8F8F]/10">
                {keys.map(k => (
                  <div key={k._id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#202020] font-mono">{k.name}</p>
                      <p className="text-xs text-[#8F8F8F]">{k.label}</p>
                      <p className="text-xs font-mono text-[#8F8F8F] mt-1">{k.maskedValue}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {k.updatedAt && (
                        <p className="text-[10px] font-mono text-[#8F8F8F]">{new Date(k.updatedAt).toLocaleDateString()}</p>
                      )}
                      <button
                        onClick={() => handleDelete(k.name)}
                        className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-[#F5F1E8] rounded-xl">
            <p className="text-xs text-[#8F8F8F] font-mono">
              <strong>Security Note:</strong> API key values are stored in MongoDB and masked in the UI. They are only used server-side in API routes. Never exposed to the browser.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
