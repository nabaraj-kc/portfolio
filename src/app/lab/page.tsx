import { Metadata } from "next";
import LabNav from "@/components/lab/LabNav";
import LabHero from "@/components/lab/LabHero";
import LabNotesStrip from "@/components/lab/LabNotesStrip";
import ExperimentGrid from "@/components/lab/ExperimentGrid";
import FeaturedInstrument from "@/components/lab/FeaturedInstrument";
import FooterCTA from "@/components/FooterCTA";

export const metadata: Metadata = {
  title: "Lab | Nabaraj KC | Code Prototypes & AI Experiments",
  description: "Experimental code prototypes, O AI OS kernel snippets, and computer vision scripts.",
  alternates: {
    canonical: "https://labs.nabarajkc.com.np",
  },
};

export default function LabPage() {
  return (
    <div className="min-h-screen lab-theme text-[#202020] flex flex-col font-sans relative">
      <LabNav />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <LabHero />

        {/* Lab Notes Strip */}
        <LabNotesStrip />

        {/* Core Experiment Directory Grid */}
        <ExperimentGrid />

        {/* Dark Featured Instrument Section */}
        <FeaturedInstrument />
      </main>

      <FooterCTA />
    </div>
  );
}
