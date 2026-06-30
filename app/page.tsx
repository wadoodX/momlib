import { LandingSidebar } from "@/components/landing/landing-sidebar";
import { Hero } from "@/components/landing/hero";
import { Sciences } from "@/components/landing/sciences";
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
    <div className="bg-paper text-ink lg:flex">
      <LandingSidebar />

      <main className="min-w-0 flex-1">
        <Hero />
        <Sciences />
        <AppPreview />
        <HowItWorks />
        <Features />
        <Audiences />
        <Testimonials />
        <PricingTeaser />
        <CallToAction />
        <Footer />
      </main>
    </div>
  );
}
