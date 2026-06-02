import { Pricing2 } from "@/components/ui/pricing2";

// Pricing on the homepage, framed to push Pro. Reuses the shared Pricing2 (whose
// CTAs now route to signup until billing is wired).
export function PricingTeaser() {
  return (
    <div id="pricing" className="scroll-mt-20">
      <Pricing2
        heading="Go further with Pro"
        description="Free for every student. Go Pro for offline downloads, early access to new material, and priority support."
      />
    </div>
  );
}
