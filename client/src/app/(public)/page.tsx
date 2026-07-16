import FeaturedCompanies from "@/components/public/FeaturedCompanies";
import FeaturedJobs from "@/components/public/FeaturedJobs";
import Features from "@/components/public/Features";
import Hero from "@/components/public/Hero";
import HowItWorks from "@/components/public/HowItWorks";
import Statistics from "@/components/public/Statistics";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statistics />
      <Features />
      <FeaturedJobs />
      <FeaturedCompanies />
      <HowItWorks />
    </>
  );
}
