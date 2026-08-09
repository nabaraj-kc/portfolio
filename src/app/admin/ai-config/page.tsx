"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

interface AIConfig {
  systemName: string;
  subdomain: string;
  status: string;
  activeAgents: number;
  systemPrompt: string;
  hardwareHooks: {
    cpuMonitoring: boolean;
    gpuBoost: boolean;
    audioStream: boolean;
    cameraFeed: boolean;
    arduinoSerial: boolean;
  };
  primaryModel: string;
  maxTokens: number;
  temperature: number;
}

const defaultAiConfig: AIConfig = {
  systemName: "O AI OS / Krrishmay Assistant",
  subdomain: "krrishmay.nabarajkc.com.np",
  status: "ONLINE",
  activeAgents: 108,
  systemPrompt: "You are Krrishmay, an autonomous AI assistant powered by the O AI operating system developed by Nabaraj KC.",
  hardwareHooks: {
    cpuMonitoring: true,
    gpuBoost: true,
    audioStream: true,
    cameraFeed: true,
    arduinoSerial: true,
  },
  primaryModel: "O-Swarm-v2 (DeepSeek / Gemini Hybrid)",
  maxTokens: 4096,
  temperature: 0.7,
};

export default function AIConfigAdminPage() {
  const [form, setForm] = useState<AIConfig>(defaultAiConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then(r => r.json())
      .then(data => { 
        if (data && data.hardwareHooks) {
          setForm(data); 
        } else {
          console.warn("Failed to load AI config from database, using default.");
          setForm(defaultAiConfig);
        }
        setLoading(false); 
      })
      .catch(e => {
        console.error("Error loading AI config", e);
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/ai-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function toggleHook(hookKey: keyof AIConfig["hardwareHooks"]) {
    setForm(f => ({
      ...f,
      hardwareHooks: {
        ...f.hardwareHooks,
        [hookKey]: !f.hardwareHooks[hookKey],
      },
    }));
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-[#FAFAF8] overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#C85A17] mb-1">
              Subdomain Control ➔ krrishmay.nabarajkc.com.np
            </p>
            <h1 className="text-3xl font-medium text-[#202020] tracking-tight">Krrishmay AI Chatbot &amp; OS Config</h1>
            <p className="text-sm text-[#8F8F8F] mt-1">Configure O AI OS kernel settings, system prompt, and active hardware hooks.</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[0,1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-[#8F8F8F]/10" />)}</div>
          ) : (
            <form onSubmit={save} className="space-y-6">
              {/* System Overview */}
              <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5 space-y-4">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">System Status &amp; Identifiers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">System Name</label>
                    <input
                      type="text"
                      value={form.systemName}
                      onChange={e => setForm(f => ({ ...f, systemName: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Target Subdomain</label>
                    <input
                      type="text"
                      value={form.subdomain}
                      onChange={e => setForm(f => ({ ...f, subdomain: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Swarm Agent Count</label>
                    <input
                      type="number"
                      value={form.activeAgents}
                      onChange={e => setForm(f => ({ ...f, activeAgents: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17]"
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-2">Krrishmay AI System Prompt</label>
                <textarea
                  rows={4}
                  value={form.systemPrompt}
                  onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#8F8F8F]/20 rounded-lg text-sm text-[#202020] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#C85A17] resize-none"
                />
              </div>

              {/* Hardware Execution Hooks */}
              <div className="bg-white border border-[#8F8F8F]/15 rounded-xl p-5">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F] mb-4">Hardware Execution Hooks (O Kernel)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "cpuMonitoring", label: "CPU & Metric Telemetry" },
                    { key: "gpuBoost", label: "GPU Acceleration Allocation" },
                    { key: "audioStream", label: "Real-time Audio Stream Listener" },
                    { key: "cameraFeed", label: "Camera Vision Analysis Hook" },
                    { key: "arduinoSerial", label: "Arduino Serial Interface" },
                  ].map(({ key, label }) => {
                    const active = form.hardwareHooks[key as keyof AIConfig["hardwareHooks"]];
                    return (
                      <div
                        key={key}
                        onClick={() => toggleHook(key as keyof AIConfig["hardwareHooks"])}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          active ? "border-[#C85A17] bg-[#C85A17]/5" : "border-[#8F8F8F]/20 bg-[#FAFAF8]"
                        }`}
                      >
                        <span className="text-xs font-mono text-[#202020]">{label}</span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${active ? "bg-[#C85A17] text-white" : "bg-[#8F8F8F]/20 text-[#8F8F8F]"}`}>
                          {active ? "ACTIVE" : "OFF"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 sticky bottom-0 bg-[#FAFAF8] py-4 border-t border-[#8F8F8F]/15">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#202020] text-[#F5F1E8] rounded-lg text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save AI Config"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Are you sure you want to trigger the autonomous AI brain? This will generate and publish a new article immediately.")) {
                      try {
                        const res = await fetch("/api/admin/autonomous?async=true");
                        const data = await res.json();
                        if (data.success) {
                          alert("Success! " + data.message + "\n\nGenerating 1 Article + 1 Research Paper in background. Check back in 1–2 minutes!");
                        } else {
                          alert("Error: " + (data.error || "Failed to trigger AI"));
                        }
                      } catch (e) {
                        alert("Failed to trigger autonomous AI");
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-[#C85A17] text-white rounded-lg text-sm font-medium hover:bg-[#A64811] transition-colors"
                >
                  Force Trigger AI Brain 🧠
                </button>
                {saved && <p className="text-sm text-green-600 font-mono">AI configuration saved successfully.</p>}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
