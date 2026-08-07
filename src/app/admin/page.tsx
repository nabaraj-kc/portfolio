"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail, Lock, Eye, EyeOff, ArrowLeft,
  CheckCircle, AlertCircle, Loader2
} from "lucide-react";

type View = "login" | "forgot" | "forgot-sent";

// Google SVG icon
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
      });
      if (googleButtonRef.current) {
        window.google?.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleCredential(response: { credential: string }) {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "google", googleCredential: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Google sign-in failed.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Google sign-in failed. Try again.");
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "email",
          email,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Incorrect credentials.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot", email: forgotEmail }),
      });
      if (res.ok) {
        setView("forgot-sent");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send reset email.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Logo + badge */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="relative h-14 w-44">
            <Image
              src="/images/logo-transparent.png"
              alt="Nabaraj KC"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">
              Admin Panel
            </p>
          </div>
        </div>

        {/* ── FORGOT PASSWORD SENT ── */}
        {view === "forgot-sent" && (
          <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-[#4A6741]" />
            </div>
            <h2 className="text-base font-medium text-[#202020] mb-2">Reset link sent</h2>
            <p className="text-sm text-[#8F8F8F] leading-relaxed mb-6">
              If <span className="text-[#202020] font-medium">{forgotEmail}</span> is the admin address, a reset link has been sent.
            </p>
            <button
              onClick={() => { setView("login"); setError(""); }}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#8F8F8F] hover:text-[#202020] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to sign in
            </button>
          </div>
        )}

        {/* ── FORGOT PASSWORD FORM ── */}
        {view === "forgot" && (
          <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <button
                onClick={() => { setView("login"); setError(""); }}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#8F8F8F] hover:text-[#202020] transition-colors mb-6"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="text-lg font-medium text-[#202020] mb-1">Reset admin password</h2>
              <p className="text-xs text-[#8F8F8F] leading-relaxed mb-6">
                Enter the admin email address. A reset link will be sent if it matches.
              </p>

              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
                    Admin email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/50 focus:border-[#C85A17] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !forgotEmail}
                  className="w-full py-3 bg-[#202020] text-[#F5F1E8] rounded-xl text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── MAIN LOGIN FORM ── */}
        {view === "login" && (
          <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-lg font-medium text-[#202020] mb-1">Admin sign in</h2>
              <p className="text-xs text-[#8F8F8F] mb-7">Authorized personnel only.</p>

              {/* Google Sign-In */}
              <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-2">
                  Google authentication
                </p>
                <div className="relative">
                  {/* Native Google button (hidden, rendered by GIS SDK) */}
                  <div ref={googleButtonRef} className="w-full overflow-hidden rounded-xl" />
                  {/* Fallback styled button before SDK loads */}
                  {googleLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-[#C85A17]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#8F8F8F] font-mono mt-1.5 text-center">
                  Only the registered admin Google account is accepted.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#8F8F8F]/15" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">or</span>
                <div className="flex-1 h-px bg-[#8F8F8F]/15" />
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin email address"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/50 focus:border-[#C85A17] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="admin-password" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView("forgot"); setForgotEmail(email); setError(""); }}
                      className="font-mono text-[10px] uppercase tracking-widest text-[#C85A17] hover:text-[#202020] transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Admin password"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/50 focus:border-[#C85A17] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#202020] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#202020] text-[#F5F1E8] rounded-xl text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Verifying..." : "Sign in to Admin Panel"}
                </button>
              </form>
            </div>

            {/* Footer strip */}
            <div className="px-8 py-4 bg-[#FAFAF8] border-t border-[#8F8F8F]/10">
              <p className="font-mono text-[10px] text-center uppercase tracking-widest text-[#8F8F8F]/70">
                nabarajkc.com.np — Restricted Access
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
