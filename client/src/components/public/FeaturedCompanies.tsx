import { ArrowRight, Building2, MapPin, BadgeCheck, Briefcase } from "lucide-react";
import Link from "next/link";

const companies = [
  {
    name: "Google",
    industry: "Technology & Cloud",
    location: "Bangalore, India",
    verified: true,
    openJobs: 24,
    color: "from-blue-500/10 to-cyan-500/10 text-blue-600",
    borderHover: "hover:border-blue-500/30",
  },
  {
    name: "Microsoft",
    industry: "Software & AI",
    location: "Hyderabad, India",
    verified: true,
    openJobs: 18,
    color: "from-indigo-500/10 to-purple-500/10 text-indigo-600",
    borderHover: "hover:border-indigo-500/30",
  },
  {
    name: "Adobe",
    industry: "Creative & Digital",
    location: "Noida, India",
    verified: true,
    openJobs: 12,
    color: "from-red-500/10 to-rose-500/10 text-red-600",
    borderHover: "hover:border-red-500/30",
  },
  {
    name: "Netflix",
    industry: "Streaming & Media",
    location: "Remote (Global)",
    verified: true,
    openJobs: 8,
    color: "from-rose-600/10 to-red-600/10 text-rose-600",
    borderHover: "hover:border-rose-600/30",
  },
  {
    name: "Spotify",
    industry: "Music & AudioTech",
    location: "Remote (Global)",
    verified: true,
    openJobs: 15,
    color: "from-green-500/10 to-emerald-500/10 text-emerald-600",
    borderHover: "hover:border-green-500/30",
  },
  {
    name: "Amazon",
    industry: "E-Commerce & AWS",
    location: "Chennai, India",
    verified: true,
    openJobs: 30,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600",
    borderHover: "hover:border-amber-500/30",
  },
];

export default function FeaturedCompanies() {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/5 opacity-40 blur-[120px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Top Companies Hiring Now
          </h2>
          <p className="text-lg text-text-secondary">
            Explore open jobs at trusted global leaders and start your application.
          </p>
        </div>

        {/* Company Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.name}
              className={`group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md ${company.borderHover}`}
            >
              <div>
                {/* Header Section: Logo + Verified Check */}
                <div className="flex items-center justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr ${company.color}`}>
                    <Building2 size={26} />
                  </div>

                  {company.verified && (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <BadgeCheck size={16} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Company Name & Industry */}
                <h3 className="mt-6 text-2xl font-bold text-text group-hover:text-primary transition-colors">
                  {company.name}
                </h3>
                <p className="mt-1 text-sm text-text-secondary font-medium">
                  {company.industry}
                </p>

                {/* Metadata items: Location & Open Jobs */}
                <div className="mt-6 space-y-2 border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                    <MapPin size={16} className="text-text-muted" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary text-sm font-semibold">
                    <Briefcase size={16} className="text-text-muted" />
                    <span className="text-primary">{company.openJobs} Active Positions</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/login" className="mt-8">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 font-semibold text-text-secondary transition-all duration-200 hover:border-primary hover:bg-secondary hover:text-primary active:scale-[0.98]">
                  Explore Company
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link href="/login">
            <button className="rounded-xl bg-primary px-8 py-4 font-semibold text-text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              View All Companies
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}