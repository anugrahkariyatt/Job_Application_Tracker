"use client";

import Link from "next/link";
import {
  Zap,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Bot,
  Circle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full bg-background text-foreground overflow-hidden font-sans">
      {/* HERO SECTION */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Info */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Where great startups<br className="hidden sm:inline" />
              meet <span className="text-foreground font-black  decoration-primary/40">top talent.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Whether you&apos;re looking to land your next high-impact role or hire pre-vetted engineers and product leads without recruiter fees.
            </p>

            {/* DUAL CTA BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register/candidate"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:translate-y-px"
              >
                <span>Find Your Next Job</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register/recruiter"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-base hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm active:translate-y-px"
              >
                <span>Start Hiring Candidates</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* DUAL MOCKUP WIDGET */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Live Platform Feed</h4>
                  <p className="text-xs text-muted-foreground">Real-time hiring activity</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Candidate Matched</p>
                  <p className="text-xs text-muted-foreground">Senior Full-Stack Engineer pitched to Stripe</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Recruiter Sourced Profile</p>
                  <p className="text-xs text-muted-foreground">Google Engineering Manager sent interview invite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND LOGO SLIDER (MARQUEE) */}
      <section className="py-10 bg-muted/30 border-y border-border overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by top engineering & product teams worldwide
        </p>

        <div className="w-full overflow-hidden select-none [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="animate-marquee py-2 flex items-center">
            {[
              { name: "Google", icon: "fa-brands fa-google" },
              { name: "Microsoft", icon: "fa-brands fa-microsoft" },
              { name: "Spotify", icon: "fa-brands fa-spotify" },
              { name: "Amazon", icon: "fa-brands fa-amazon" },
              { name: "Airbnb", icon: "fa-brands fa-airbnb" },
              { name: "Stripe", icon: "fa-brands fa-stripe" },
              { name: "Google", icon: "fa-brands fa-google" },
              { name: "Microsoft", icon: "fa-brands fa-microsoft" },
              { name: "Spotify", icon: "fa-brands fa-spotify" },
              { name: "Amazon", icon: "fa-brands fa-amazon" },
              { name: "Airbnb", icon: "fa-brands fa-airbnb" },
              { name: "Stripe", icon: "fa-brands fa-stripe" },
            ].map((company, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-8 sm:px-12 text-xl font-bold text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
              >
                <i className={`${company.icon} text-2xl text-foreground/70`} />
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL AUDIENCE FEATURES (Recruiter vs Candidate) */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Built for Both Job Seekers & Hiring Teams
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover what you can do on Nuvora whether you&apos;re hunting for your next role or building your core team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recruiter Card */}
            <div
              id="employers"
              className="bg-card text-card-foreground rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-border shadow-sm hover:border-border/80 transition-all space-y-8"
            >
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
                  Hire & Manage Top Talent Effortlessly
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Post open roles, manage applicant review pipelines, and connect directly with qualified candidates on Nuvora.
                </p>

                <ul className="space-y-3.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Post & Manage Job Listings:</strong> Publish open positions with salary ranges & requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Track Applicant Pipeline:</strong> Review candidate profiles, resumes, and portfolios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Update Application Statuses:</strong> Shortlist applicants or mark candidates as Hired / Rejected</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Verified Company Profile:</strong> Build brand credibility to attract top-tier applicants</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/register/recruiter"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px"
                >
                  <span>Post Jobs as Recruiter</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Candidate Card */}
            <div
              id="candidates"
              className="bg-card text-card-foreground rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-border shadow-sm hover:border-border/80 transition-all space-y-8"
            >
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
                  Land Your Next Role & Track Status Live
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Apply directly to open positions, showcase your experience, and track your application status in real-time.
                </p>

                <ul className="space-y-3.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>1-Click Quick Apply:</strong> Submit applications instantly using your Nuvora candidate profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Live Application Tracker:</strong> Monitor status changes from Applied to Interview & Offer</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Salary & Job Discovery:</strong> Filter positions with transparent compensation details upfront</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Saved Jobs & History:</strong> Bookmark opportunities and access your full application history</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/register/candidate"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm hover:bg-slate-800 transition-all shadow-xs active:translate-y-px"
                >
                  <span>Join as Candidate</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Featured Opportunities
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore high-impact positions from venture-backed startups and industry leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Job Card 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/60 transition-all shadow-xs hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-lg">
                    G
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    Full-time
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Senior React Developer</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Google • Mountain View, CA (Remote)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-bold text-sm text-foreground">$140k - $180k</span>
                <Link
                  href="/register/candidate"
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/60 transition-all shadow-xs hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    Full-time
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Frontend Engineer (Core UI)</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    OpenAI • San Francisco, CA
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-bold text-sm text-foreground">$160k - $210k</span>
                <Link
                  href="/register/candidate"
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/60 transition-all shadow-xs hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    S
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    Remote
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">DevOps / Cloud Architect</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Spotify • Remote (Worldwide)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-bold text-sm text-foreground">$130k - $170k</span>
                <Link
                  href="/register/candidate"
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
