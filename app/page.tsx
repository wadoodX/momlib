import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Sciences } from "@/components/landing/sciences";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { QuoteStats } from "@/components/landing/quote-stats";
import { Pricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/landing-footer";

// The public marketing landing page. Bespoke, light-only, and fully scoped
// under `.landing` (see the palette block in app/globals.css) so it never
// touches the signed-in app's warm-parchment light/dark theme.
export default function HomePage() {
  return (
    <div className="landing min-h-screen">
      <div className="mx-auto w-full max-w-[1400px]">
        <LandingNav />
        <main>
          <Hero />
          <Sciences />
          <HowItWorks />
          <Features />
          <QuoteStats />
          <Pricing />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
