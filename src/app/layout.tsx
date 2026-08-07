import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PersonalAssistantChatbot from "@/components/PersonalAssistantChatbot";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nabarajkc.com.np"),
  title: "Nabaraj KC | AI & Software Engineer | Kathmandu",
  description:
    "Personal portfolio of Nabaraj KC, a Software Engineer based in Kathmandu, Nepal.",
  keywords: [
    "Nabaraj KC",
    "AI Engineer",
    "Software Engineer Kathmandu",
    "Nepal Tech",
    "Machine Learning",
    "O AI OS",
  ],
  authors: [{ name: "Nabaraj KC" }],
  icons: {
    icon: "/icon.svg",
    apple: "/images/logo-cropped.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nabaraj KC | AI & Software Engineer",
    description:
      "Building intelligent systems, high-throughput backend architecture, and ML applications in Kathmandu.",
    url: "https://nabarajkc.com.np",
    siteName: "Nabaraj KC",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} h-full antialiased selection:bg-[#C85A17] selection:text-white`}
    >
      {/* body bg is set in globals.css with the vortex background-image */}
      <body suppressHydrationWarning className="min-h-full flex flex-col text-[#202020] overflow-x-hidden">
        {children}
        <PersonalAssistantChatbot />
      </body>
    </html>
  );
}
