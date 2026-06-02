import { Navbar5 } from "@/components/ui/navbar-5";
import { Pricing2 } from "@/components/ui/pricing2";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Plans & pricing",
  description:
    "Nibras is free for every student. Go Pro for offline downloads, early access to new material, and priority support.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Navbar5 />
      <Pricing2 />
      <Footer />
    </main>
  );
}
