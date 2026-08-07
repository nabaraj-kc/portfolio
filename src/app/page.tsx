import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import DarkCTABand from "@/components/DarkCTABand";
import WorkGrid from "@/components/WorkGrid";
import WritingSection from "@/components/WritingSection";
import FooterCTA from "@/components/FooterCTA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen text-[#202020] flex flex-col font-sans">
      {/* 1. Nav (Sticky, transparent to solid paper on scroll) */}
      <Nav />

      {/* Main Page Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. About Section */}
        <About />

        {/* 4. Timeline */}
        <Timeline />

        {/* 5. Full-bleed dark CTA band */}
        <DarkCTABand />

        {/* 6. Work grid */}
        <WorkGrid />

        {/* 7. Writing */}
        <WritingSection />
      </main>

      {/* 8. Closing CTA / Footer */}
      <FooterCTA />
    </div>
  );
}
