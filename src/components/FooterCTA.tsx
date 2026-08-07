"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const countryCodes = [
  { country: "Nepal", code: "+977" },
  { country: "India", code: "+91" },
  { country: "United States / Canada", code: "+1" },
  { country: "United Kingdom", code: "+44" },
  { country: "Australia", code: "+61" },
  { country: "Germany", code: "+49" },
  { country: "Japan", code: "+81" },
  { country: "China", code: "+86" },
  { country: "France", code: "+33" },
  { country: "Singapore", code: "+65" },
  { country: "United Arab Emirates", code: "+971" },
  { country: "Saudi Arabia", code: "+966" },
  { country: "Qatar", code: "+974" },
  { country: "Bangladesh", code: "+880" },
  { country: "Pakistan", code: "+92" },
  { country: "Sri Lanka", code: "+94" },
  { country: "Bhutan", code: "+975" },
  { country: "Maldives", code: "+960" },
  { country: "Korea, Republic of", code: "+82" },
  { country: "Malaysia", code: "+60" },
  { country: "Thailand", code: "+66" },
  { country: "Indonesia", code: "+62" },
  { country: "Vietnam", code: "+84" },
  { country: "Philippines", code: "+63" },
  { country: "Netherlands", code: "+31" },
  { country: "Switzerland", code: "+41" },
  { country: "Sweden", code: "+46" },
  { country: "Norway", code: "+47" },
  { country: "Denmark", code: "+45" },
  { country: "Finland", code: "+358" },
  { country: "Italy", code: "+39" },
  { country: "Spain", code: "+34" },
  { country: "Portugal", code: "+351" },
  { country: "Brazil", code: "+55" },
  { country: "Mexico", code: "+52" },
  { country: "Argentina", code: "+54" },
  { country: "South Africa", code: "+27" },
  { country: "New Zealand", code: "+64" },
  { country: "Ireland", code: "+353" },
  { country: "Israel", code: "+972" },
  { country: "Turkey", code: "+90" },
  { country: "Egypt", code: "+20" },
  { country: "Nigeria", code: "+234" },
  { country: "Kenya", code: "+254" },
];

export default function FooterCTA() {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+977",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", countryCode: "+977", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer id="contact" className="bg-transparent border-t border-[#8F8F8F]/20 pt-24 md:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main CTA & Contact Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Left Column: Direct Text & Mail Link */}
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#8F8F8F]">
                  05 // Contact
                </span>
                <span className="h-[1px] w-12 bg-[#8F8F8F]/30" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#202020] tracking-tight leading-[1.1] font-sans">
                Have a project in mind or want to collaborate?
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className="text-base text-[#202020]/75 leading-relaxed">
                Send a message through the form or email directly. Messages are delivered straight to my inbox.
              </p>
            </ScrollReveal>

            {/* Direct Email & Phone Link */}
            <ScrollReveal delay={200}>
              <div className="pt-2 space-y-2">
                <a
                  href="mailto:nabarajkc43@gmail.com"
                  className="block text-lg sm:text-2xl font-medium text-[#202020] hover:text-[#C85A17] transition-colors underline underline-offset-8 decoration-2 decoration-[#8F8F8F]/40 hover:decoration-[#C85A17] break-all sm:break-normal"
                >
                  nabarajkc43@gmail.com
                </a>
                <a
                  href="tel:+9779761696109"
                  className="inline-flex items-center gap-2 text-base sm:text-lg font-mono text-[#C85A17] hover:underline"
                >
                  <span>📞 +977 9761696109</span>
                </a>
                <p className="font-mono text-xs text-[#8F8F8F] pt-1 uppercase tracking-wider">
                  Typical response time: under 24 hours (Kathmandu, NPT)
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6">
            <ScrollReveal delay={250}>
              <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#8F8F8F]/20 shadow-whisper">
                <h3 className="text-xl font-medium text-[#202020] mb-6">
                  Send a Message
                </h3>

                {status === "success" ? (
                  <div className="p-6 bg-[#F5F1E8] rounded-xl border border-[#8F8F8F]/20 space-y-2 text-center">
                    <p className="text-base font-medium text-[#202020]">
                      Message Sent
                    </p>
                    <p className="text-sm text-[#202020]/75">
                      Thank you. Your message has been sent, I will get back to you soon.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-4 font-mono text-xs text-[#C85A17] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Input */}
                    <div>
                      <label htmlFor="name" className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]/80 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F5F1E8]/50 border border-[#8F8F8F]/30 rounded-xl text-sm text-[#202020] focus:outline-none focus:border-[#C85A17] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]/80 mb-2">
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="Your email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F5F1E8]/50 border border-[#8F8F8F]/30 rounded-xl text-sm text-[#202020] focus:outline-none focus:border-[#C85A17] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Phone Number Input with Country Code */}
                    <div>
                      <label htmlFor="phone" className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]/80 mb-2">
                        Contact Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="w-1/3 min-w-[120px] px-3 py-3 bg-[#F5F1E8]/50 border border-[#8F8F8F]/30 rounded-xl text-sm text-[#202020] focus:outline-none focus:border-[#C85A17] focus:bg-white transition-colors font-mono"
                        >
                          {countryCodes.map((item) => (
                            <option key={item.country + item.code} value={item.code}>
                              {item.country} ({item.code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Your contact number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-2/3 px-4 py-3 bg-[#F5F1E8]/50 border border-[#8F8F8F]/30 rounded-xl text-sm text-[#202020] focus:outline-none focus:border-[#C85A17] focus:bg-white transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div>
                      <label htmlFor="message" className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#202020]/80 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        placeholder="Your message..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F5F1E8]/50 border border-[#8F8F8F]/30 rounded-xl text-sm text-[#202020] focus:outline-none focus:border-[#C85A17] focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {/* Error Notice */}
                    {status === "error" && (
                      <p className="text-xs font-mono text-red-600">
                        Error sending message. Please try again.
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#202020] text-[#F5F1E8] text-sm font-medium hover:bg-[#C85A17] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {status === "loading" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Social Links & Navigation Row */}
        <ScrollReveal delay={300}>
          <div className="pt-12 border-t border-[#8F8F8F]/20 flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12">
            {/* Outline Monochrome Social Links */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#202020]">
              <a
                href="https://github.com/nabaraj-kc"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 hover:border-[#C85A17] hover:text-[#C85A17] transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/nabaraj-kc-8a8081282/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 hover:border-[#C85A17] hover:text-[#C85A17] transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com/nabarajkc43"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 hover:border-[#C85A17] hover:text-[#C85A17] transition-colors"
              >
                X (Twitter)
              </a>
              <a
                href="https://www.instagram.com/nabaraj_kcc/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 hover:border-[#C85A17] hover:text-[#C85A17] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/nabaraj.kc.783906"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 hover:border-[#C85A17] hover:text-[#C85A17] transition-colors"
              >
                Facebook
              </a>
            </div>

            {/* Quick Subdomain & Page Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-[#8F8F8F]">
              <Link href="/#work" className="hover:text-[#202020] transition-colors">
                Work
              </Link>
              <a href="https://research.nabarajkc.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-[#202020] transition-colors">
                Research
              </a>
              <a href="https://labs.nabarajkc.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-[#202020] transition-colors">
                Lab
              </a>
              <a href="https://articles.nabarajkc.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-[#202020] transition-colors">
                Articles
              </a>
              <a href="https://krrishmay.nabarajkc.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-[#202020] transition-colors text-[#C85A17]">
                Krrishmay AI
              </a>
              <Link href="/#about" className="hover:text-[#202020] transition-colors">
                About
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Small Footer Legal Row with Logo */}
        <div className="pt-8 border-t border-[#8F8F8F]/20 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8F8F8F] gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-7 w-24">
              <Image
                src="/images/logo-transparent.png"
                alt="Nabaraj KC Logo"
                fill
                className="object-contain object-left"
                unoptimized
              />
            </div>
            <span>© {currentYear} Nabaraj KC. All rights reserved. Kathmandu, Nepal.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sitemap.xml" className="hover:text-[#202020] transition-colors">
              Sitemap
            </Link>
            <Link href="/rss.xml" className="hover:text-[#202020] transition-colors">
              RSS Feed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
