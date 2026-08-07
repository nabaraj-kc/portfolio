"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  // Check user session on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    const session = getCookie("user_session");
    if (session) {
      try {
        setUser(JSON.parse(decodeURIComponent(session)));
      } catch (e) {
        console.error("Failed to parse user session cookie:", e);
      }
    }
  }, []);

  // Google OAuth credential callback
  const handleGoogleCredentialResponse = async (response: any) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google",
          googleCredential: response.credential,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Google Sign-In failed.");
      } else {
        setSuccess("Signed in with Google successfully!");
        setUser(data.user);
        
        // Log event
        fetch("/api/behaviour", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "user_login_google",
            email: data.user.email,
            details: { username: data.user.username },
          }),
        }).catch(err => console.error(err));

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services library
  useEffect(() => {
    if (user) return; // No need to load if already logged in

    const scriptId = "google-gsi-script";
    if (document.getElementById(scriptId)) {
      // Re-render Google button if script is already present
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "470752975485-02upad1e4e977obo164iui135a54sc4g.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 320 }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "470752975485-02upad1e4e977obo164iui135a54sc4g.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 320 }
        );
      }
    };
    document.body.appendChild(script);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = isLogin 
        ? { action: "login", email, password }
        : { action: "register", username, email, password };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed.");
      } else {
        setSuccess(isLogin ? "Signed in successfully!" : "Account created successfully!");
        setUser(data.user);

        // Track behaviour
        fetch("/api/behaviour", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: isLogin ? "user_login" : "user_register",
            email: data.user.email,
            details: { username: data.user.username },
          }),
        }).catch(err => console.error(err));

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_mock",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Mock Google Sign-In failed.");
      } else {
        setSuccess("Signed in with Google (Simulated)!");
        setUser(data.user);
        
        fetch("/api/behaviour", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "user_login_google_mock",
            email: data.user.email,
            details: { username: data.user.username },
          }),
        }).catch(err => console.error(err));

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#202020] flex flex-col font-sans">
      <Nav />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <ScrollReveal>
            <div className="bg-[#FFFFFF] border border-[#8F8F8F]/25 rounded-2xl p-8 sm:p-10 shadow-whisper space-y-6">
              {user ? (
                /* Logged In View */
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 mb-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-medium text-[#202020]">Welcome back!</h2>
                    <p className="font-mono text-sm text-[#C85A17] font-semibold">{user.username}</p>
                    <p className="text-xs text-[#8F8F8F]">{user.email}</p>
                  </div>
                  <p className="text-sm text-[#202020]/75">
                    You are authenticated across Kathmandu Portfolio and all system subdomains.
                  </p>
                  <div className="pt-2 flex flex-col gap-3">
                    <a
                      href="/"
                      className="w-full py-2.5 rounded-lg bg-[#202020] hover:bg-[#C85A17] text-[#F5F1E8] text-xs font-mono font-bold tracking-wider uppercase text-center transition-colors"
                    >
                      Back to Home
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-mono font-bold tracking-wider uppercase transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Auth Form View */
                <>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#C85A17]/10 flex items-center justify-center mx-auto text-[#C85A17] mb-2">
                      {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                    <h2 className="text-2xl font-medium tracking-tight text-[#202020]">
                      {isLogin ? "Sign In" : "Register Account"}
                    </h2>
                    <p className="text-xs text-[#8F8F8F]">
                      Unlock database-backed likes, comments, and session history sync.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/25 text-red-700 text-xs px-3.5 py-2.5 rounded-lg text-center font-mono">
                      {error.includes("already exists") ? (
                        <span>
                          {error}.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setIsLogin(true);
                            }}
                            className="underline text-[#C85A17] font-bold hover:text-[#202020] transition-all cursor-pointer"
                          >
                            Sign In instead?
                          </button>
                        </span>
                      ) : (
                        error
                      )}
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs px-3.5 py-2.5 rounded-lg text-center font-mono">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
                          Username
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. judhakc"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-[#8F8F8F]/25 bg-[#FAFAF8] text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-[#8F8F8F]/25 bg-[#FAFAF8] text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
                          Password
                        </label>
                        {isLogin && (
                          <Link
                            href="/forgot-password"
                            className="font-mono text-[9px] uppercase tracking-widest text-[#C85A17] hover:text-[#202020] transition-colors"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-[#8F8F8F]/25 bg-[#FAFAF8] text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-[#202020] hover:bg-[#C85A17] text-[#F5F1E8] text-xs font-mono font-bold tracking-wider uppercase transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Authenticating..." : isLogin ? "Login Now" : "Register Now"}
                    </button>
                  </form>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[#8F8F8F]/20"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-mono text-[#8F8F8F] uppercase tracking-widest bg-white">
                      or
                    </span>
                    <div className="flex-grow border-t border-[#8F8F8F]/20"></div>
                  </div>

                  {/* Google Authenticator Node Button */}
                  <div className="flex justify-center w-full min-h-[44px]">
                    <div id="google-signin-btn" className="pointer-events-auto"></div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setError("");
                        setIsLogin(!isLogin);
                      }}
                      className="font-mono text-[10px] text-[#C85A17] hover:underline uppercase tracking-wider font-semibold"
                    >
                      {isLogin ? "Create an account" : "Back to Sign In"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </main>

      <FooterCTA />
    </div>
  );
}
