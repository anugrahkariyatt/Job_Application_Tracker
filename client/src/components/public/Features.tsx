import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Search,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Job Search",
    description:
      "Find opportunities that align perfectly with your expertise, industry preferences, and target location.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: ClipboardCheck,
    title: "Application Tracking",
    description:
      "Track your complete pipeline progress from Applied to Review, Interview, and Hired in a unified workspace.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description:
      "Receive instant updates whenever recruiters view your profile, download your resume, or schedule interviews.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Alerts",
    description:
      "Stay ahead of the game with automatic recommendations tailored to your career criteria.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Building2,
    title: "Company Subscriptions",
    description:
      "Follow leading firms and get first-priority notifications as soon as they publish new opportunities.",
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    icon: ShieldCheck,
    title: "Verified Companies",
    description:
      "Apply securely to authenticated organizations manually vetted by our platform team.",
    color: "bg-rose-500/10 text-rose-500",
  },
];

export default function Features() {
  return (
    <section className="relative bg-surface/30 py-24 lg:py-32">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 opacity-40 blur-[100px]"></div>
      <div className="absolute bottom-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 opacity-30 blur-[120px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto mb-20 max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Everything You Need to Navigate Your Career
          </h2>
          <p className="text-lg text-text-secondary">
            From smart search filters to automated tracking, manage your entire job hunt efficiently inside one secure platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full"></div>

                <div className="space-y-6">
                  {/* Icon Block */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${feature.color}`}>
                    <Icon size={24} />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-text">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
