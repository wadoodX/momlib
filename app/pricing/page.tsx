import { Navbar5 } from "@/components/ui/navbar-5";
import { Pricing2 } from "@/components/ui/pricing2";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Plans — Nibras",
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
