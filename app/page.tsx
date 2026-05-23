import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Audience } from "@/components/landing/audience";
import { CallToAction } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="bg-paper text-ink">
      <Hero />
      <Features />
      <Audience />
      <CallToAction />
      <Footer />
    </main>
  );
}
