import { PricingContent } from "@/components/pricing/PricingContent";

export default function CandidatePricingPage() {
  return (
    <div className="space-y-6">
      <PricingContent defaultRole="candidate" showToggle={false} />
    </div>
  );
}
