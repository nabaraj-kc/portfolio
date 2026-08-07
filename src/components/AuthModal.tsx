"use client";

import { useState } from "react";
import { X, LogIn, UserPlus, Mail, Lock, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { username: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        // Successful registration or login
        onSuccess(data.user);
        setUsername("");
        setEmail("");
        setPassword("");
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication services.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        username: "Google User",
        email: "googleuser@gmail.com",
      };
      // Set session cookie mock
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: mockUser.username,
          email: mockUser.email,
          password: "google-auth-bypass-key-2026",
        }),
      }).then(() => {
        onSuccess(mockUser);
        onClose();
        setLoading(false);
      }).catch(() => {
        setError("Google Login failed");
        setLoading(false);
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-[#F5F1E8] border border-[#8F8F8F]/30 rounded-2xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#202020]/5 text-[#8F8F8F] hover:text-[#202020] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#C85A17]/10 flex items-center justify-center mx-auto text-[#C85A17] mb-2">
            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-[#202020]">
            {isLogin ? "Sign In to Portfolio" : "Create Account"}
          </h2>
          <p className="text-xs text-[#8F8F8F] max-w-xs mx-auto">
            Access customized dashboard metrics, save articles, and customize Krrishmay chatbot.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-700 text-xs px-3.5 py-2.5 rounded-lg text-center font-mono">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. judhakc"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-sm border border-[#8F8F8F]/25 bg-white text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm border border-[#8F8F8F]/25 bg-white text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] uppercase tracking-widest text-[#8F8F8F] font-bold">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm border border-[#8F8F8F]/25 bg-white text-[#202020] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C85A17] transition-all placeholder:text-[#8F8F8F]/40"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#202020] hover:bg-[#C85A17] text-[#F5F1E8] text-xs font-mono font-bold tracking-wider uppercase transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isLogin ? "Login Now" : "Register Now"}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#8F8F8F]/20"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono text-[#8F8F8F] uppercase tracking-widest bg-[#F5F1E8]">
            or
          </span>
          <div className="flex-grow border-t border-[#8F8F8F]/20"></div>
        </div>

        {/* Google Authentication Option */}
        <button
          onClick={handleMockGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border border-[#8F8F8F]/30 hover:border-[#202020] bg-white text-[#202020] text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.307 2.659 1.277 6.56l3.99 3.205z"
            />
            <path
              fill="#4285F4"
              d="M23.04 12.26c0-.82-.07-1.61-.2-2.38H12v4.51h6.2c-.27 1.41-1.07 2.6-2.27 3.4l3.52 3.51c2.06-1.9 3.59-4.7 3.59-9.03z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235A7.086 7.086 0 0 1 4.91 12c0-.79.13-1.56.356-2.235L1.277 6.56C.46 8.2 .01 10.05.01 12c0 1.95.45 3.8 1.267 5.44l3.99-3.205z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.07 7.96-2.92l-3.52-3.51c-.98.66-2.23 1.06-4.44 1.06-4.09 0-7.56-2.77-8.79-6.51L1.22 15.33C3.25 21.27 8.87 24 12 24z"
            />
          </svg>
          <span>Authenticate with Google</span>
        </button>

        {/* Toggle Form Mode */}
        <div className="text-center">
          <button
            onClick={() => {
              setError("");
              setIsLogin(!isLogin);
            }}
            className="font-mono text-[10px] text-[#C85A17] hover:underline uppercase tracking-wider font-semibold"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
