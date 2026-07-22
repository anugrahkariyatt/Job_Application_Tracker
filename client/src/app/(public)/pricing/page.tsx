import { PricingContent } from "@/components/pricing/PricingContent";

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <PricingContent showToggle={true} />
    </div>
  );
}
