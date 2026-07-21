import { BriefcaseBusiness, Building2, Users, ClipboardCheck } from "lucide-react";

const stats = [
  {
    value: "10,000+",
    label: "Active Jobs",
    icon: BriefcaseBusiness,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    shadow: "shadow-blue-500/5",
  },
  {
    value: "2,500+",
    label: "Verified Companies",
    icon: Building2,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    shadow: "shadow-indigo-500/5",
  },
  {
    value: "50,000+",
    label: "Candidates",
    icon: Users,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    shadow: "shadow-emerald-500/5",
  },
  {
    value: "100,000+",
    label: "Applications Tracking",
    icon: ClipboardCheck,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    shadow: "shadow-amber-500/5",
  },
];

export default function Statistics() {
  return (
    <section className="relative bg-background py-20 lg:py-28 overflow-hidden">
      {/* Subtle top border and radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 -z-10 h-64 w-[600px] rounded-full bg-primary/5 opacity-50 blur-[100px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Trusted by Professionals Building Careers
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-text-secondary">
            Empowering job seekers and recruiters around the globe with a reliable, data-driven platform.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.label}
                className={`relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 ${item.shadow}`}
              >
                {/* Glowing decorative indicator */}
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-bl from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon Wrapper */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                    <IconComponent size={24} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-4xl font-extrabold tracking-tight text-text">
                      {item.value}
                    </h3>
                    <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                      {item.label}
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