import Link from "next/link";
import {
  Sparkles,
  Target,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Award,
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Nuvora Job Application Tracker & AI Sourcing",
  description:
    "Learn how Nuvora connects candidates and recruiters using AI-driven candidate screening, instant job alerts, and real-time application tracking.",
};

const stats = [
  { label: "Active Candidates", value: "25,000+" },
  { label: "Partner Companies", value: "1,200+" },
  { label: "AI Screening Accuracy", value: "98.4%" },
  { label: "Applications Processed", value: "150,000+" },
];

const values = [
  {
    icon: Brain,
    title: "AI-Powered Precision",
    description:
      "Leveraging n8n automation and advanced AI scoring to match candidates with their ideal roles instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "Empowering applicants with real-time status updates and giving recruiters verified talent profiles.",
  },
  {
    icon: Zap,
    title: "Seamless Efficiency",
    description:
      "Eliminating traditional hiring friction with one-click applications, instant alerts, and automated scheduling.",
  },
  {
    icon: Users,
    title: "People First",
    description:
      "Building human-centered career tools that help professionals grow and organizations build dream teams.",
  },
];

const features = [
  {
    role: "For Candidates",
    title: "Track, Apply, and Land Your Dream Job",
    items: [
      "Real-time application status updates from company pipelines",
      "Instant job notifications tailored to your skill set",
      "AI resume suitability scoring and skill match insights",
      "Unified dashboard for managing all submitted applications",
    ],
    ctaText: "Create Candidate Account",
    ctaHref: "/register/candidate",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    role: "For Employers",
    title: "Screen Candidates 10x Faster with AI",
    items: [
      "Automated n8n candidate suitability scoring & skill match analysis",
      "Unified applicant management dashboard & status board",
      "Direct interview scheduling and applicant email notifications",
      "Verified company profile badge & job broadcast system",
    ],
    ctaText: "Start Hiring with Nuvora",
    ctaHref: "/register/recruiter",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Empowering the Future of Hiring</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Revolutionizing How{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
            Talent Meets Opportunity
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nuvora is an end-to-end Job Application & Talent Management platform.
          We bridge the gap between ambitious job seekers and forward-thinking recruiters
          with automated AI screening, real-time alerts, and transparent tracking.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/40 transition-all"
            >
              <div className="text-3xl md:text-4xl font-black text-foreground">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission & Story */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border/40">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Target className="h-4 w-4" />
              <span>Our Mission</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Eliminating the Black Hole of Job Searching & Hiring
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Traditional job portals leave applicants wondering if their resumes were ever opened,
              while recruiters struggle under mountains of unvetted applications.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              At Nuvora, we built a modern ecosystem powered by n8n workflows and AI suitability screening.
              Candidates get instant transparency, while recruiters quickly identify top talent matched to their open positions.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Automated AI Candidate Assessment</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-muted/50 p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Built for Modern Teams</h4>
                  <p className="text-xs text-muted-foreground">Candidate & Employer Platform</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Active & Live
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Average Time to Interview</span>
                </div>
                <span className="text-xs font-bold text-emerald-500">3x Faster</span>
              </div>

              <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-semibold text-foreground">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Recruiter Match Satisfaction</span>
                </div>
                <span className="text-xs font-bold text-amber-500">98.4%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border/40">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Core Values</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            What Drives Everything We Build
          </h2>
          <p className="text-sm text-muted-foreground">
            Our principles ensure that every feature we ship creates genuine value for job seekers and hiring teams alike.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all space-y-4 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Sided Platform Overview */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border/40">
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl border border-border/60 bg-card/70 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${feat.badgeColor}`}
                >
                  {feat.role}
                </span>
                <h3 className="text-2xl font-bold text-foreground">
                  {feat.title}
                </h3>
                <ul className="space-y-3 pt-2">
                  {feat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={feat.ctaHref}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md"
              >
                <span>{feat.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-emerald-600 text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Experience Next-Generation Sourcing & Job Search?
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto">
            Join thousands of professionals and top employers managing their hiring pipelines on Nuvora today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/register/candidate"
              className="py-3.5 px-7 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-all shadow-lg"
            >
              Join as Candidate
            </Link>
            <Link
              href="/register/recruiter"
              className="py-3.5 px-7 rounded-xl border-2 border-white/40 bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Post Jobs as Recruiter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
