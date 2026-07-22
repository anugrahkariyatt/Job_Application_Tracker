import { PricingContent } from "@/components/pricing/PricingContent";

export default function RecruiterPricingPage() {
  return (
    <div className="space-y-6">
      <PricingContent defaultRole="recruiter" showToggle={false} />
    </div>
  );
}
