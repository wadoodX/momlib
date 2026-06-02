import { LanternBackdrop } from "@/components/landing/lantern-backdrop";
import { Hero } from "@/components/landing/hero";
import { AppPreview } from "@/components/landing/app-preview";
import { Audiences } from "@/components/landing/audiences";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { CallToAction } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative bg-transparent text-ink">
      <LanternBackdrop />
      <Hero />

      {/* One continuous surface for the rest of the page. The wash ramps in over
          the first stretch so the bold-lantern hero melts into the content with
          no seam and no empty gap, then holds steady (lanterns glow through). */}
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0, color-mix(in oklab, var(--color-paper) 82%, transparent) 18vh)",
        }}
      >
        <AppPreview />
        <Audiences />
        <HowItWorks />
        <Features />
        <Testimonials />
        <PricingTeaser />
        <CallToAction />
        <Footer />
      </div>
    </main>
  );
}
