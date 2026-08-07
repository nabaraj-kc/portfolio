import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PersonalAssistantChatbot from "@/components/PersonalAssistantChatbot";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://nabarajkc.com.np";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nabaraj KC | AI Researcher & Software Engineer | Kathmandu, Nepal",
    template: "%s | Nabaraj KC",
  },
  description:
    "Official portfolio and research platform of Nabaraj KC — Software Engineer & AI Researcher in Kathmandu, Nepal. Specialized in AI models, autonomous agents, and high-throughput systems.",
  keywords: [
    "Nabaraj KC",
    "Nabaraj KC Nepal",
    "Nabaraj KC Software Engineer",
    "Nabaraj KC AI Researcher",
    "Nabaraj KC Kathmandu",
    "AI Engineer Nepal",
    "Software Engineer Kathmandu",
    "Krrishmay AI",
    "Machine Learning Researcher Nepal",
    "Full Stack Engineer Nepal",
    "Nepali Natural Language Processing",
    "AI Research Papers Nepal",
    "Next.js Developer Nepal",
  ],
  authors: [{ name: "Nabaraj KC", url: BASE_URL }],
  creator: "Nabaraj KC",
  publisher: "Nabaraj KC",
  icons: {
    icon: "/icon.svg",
    apple: "/images/logo-cropped.png",
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Nabaraj KC | AI Researcher & Software Engineer",
    description:
      "Explore research papers, AI lab instruments, articles, and intelligent systems developed by Nabaraj KC.",
    url: BASE_URL,
    siteName: "Nabaraj KC — Personal Engineering Platform",
    images: [
      {
        url: `${BASE_URL}/images/user-profile-transparent.png`,
        width: 1200,
        height: 630,
        alt: "Nabaraj KC — AI Researcher & Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nabaraj KC | AI Researcher & Software Engineer",
    description: "Personal portfolio, AI lab tools, and research publications of Nabaraj KC.",
    creator: "@nabarajkc43",
    images: [`${BASE_URL}/images/user-profile-transparent.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Person & WebSite JSON-LD Structured Data
  const jsonLdPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nabaraj KC",
    "alternateName": ["Nabaraj KC", "Nabaraj_KC", "NabarajKC"],
    "url": BASE_URL,
    "image": `${BASE_URL}/images/user-profile-transparent.png`,
    "jobTitle": "AI Researcher & Software Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "Krrishmay AI Labs",
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kathmandu",
      "addressCountry": "Nepal",
    },
    "sameAs": [
      "https://github.com/nabaraj-kc",
      "https://www.linkedin.com/in/nabaraj-kc-8a8081282/",
      "https://x.com/nabarajkc43",
      "https://www.instagram.com/nabaraj_kcc/",
      "https://www.facebook.com/nabaraj.kc.783906",
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Software Engineering",
      "Deep Learning",
      "Natural Language Processing",
      "Full Stack Development",
    ],
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nabaraj KC",
    "url": BASE_URL,
    "publisher": {
      "@type": "Person",
      "name": "Nabaraj KC",
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/articles?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} h-full antialiased selection:bg-[#C85A17] selection:text-white`}
    >
      <head>
        {/* JSON-LD Structured Data for Google Rank #1 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col text-[#202020] overflow-x-hidden">
        {children}
        <PersonalAssistantChatbot />
      </body>
    </html>
  );
}
