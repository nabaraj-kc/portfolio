import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Nabaraj KC",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin pages handle their own full-page layout (with AdminNav sidebar)
  // No wrapper needed — each page renders its own flex container
  return <>{children}</>;
}
