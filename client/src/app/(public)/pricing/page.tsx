import { Suspense } from "react";
import { PricingContent } from "@/components/pricing/PricingContent";

export default function PublicPricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading pricing...</div>}>
      <PricingContent defaultRole="candidate" showToggle={true} />
    </Suspense>
  );
}
