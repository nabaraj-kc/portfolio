"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1">
              Account Recovery
            </p>
            <h1 className="text-2xl font-medium text-[#202020] tracking-tight">Forgot password</h1>
            <p className="text-sm text-[#8F8F8F] mt-2 leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[#4A6741]" />
              </div>
              <h2 className="text-base font-medium text-[#202020] mb-2">Check your inbox</h2>
              <p className="text-sm text-[#8F8F8F] leading-relaxed mb-6">
                If <span className="text-[#202020] font-medium">{email}</span> is registered, you&apos;ll receive a reset link within a few minutes.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 text-sm text-[#C85A17] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/50 focus:border-[#C85A17] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 px-6 bg-[#202020] text-[#F5F1E8] rounded-xl text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending link..." : "Send reset link"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#8F8F8F]/10 text-center">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8F8F8F] hover:text-[#202020] transition-colors font-mono uppercase tracking-widest"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <FooterCTA />
    </>
  );
}
