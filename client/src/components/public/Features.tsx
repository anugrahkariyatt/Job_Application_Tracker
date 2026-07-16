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
      "Discover opportunities that match your skills, experience, and career goals.",
  },
  {
    icon: ClipboardCheck,
    title: "Application Tracking",
    description:
      "Track every application from Applied to Hired in one organized dashboard.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description:
      "Receive instant updates whenever recruiters review or update your application.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Alerts",
    description:
      "Stay informed with personalized job recommendations based on your preferences.",
  },
  {
    icon: Building2,
    title: "Company Subscriptions",
    description:
      "Follow companies and receive notifications whenever they publish new jobs.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Companies",
    description:
      "Apply with confidence to trusted organizations verified by our platform.",
  },
];

export default function Features() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-text">
            Everything You Need for Your Career Journey
          </h2>

          <p className="mt-4 text-lg text-text-secondary">
            From discovering opportunities to tracking every application, manage
            your entire hiring journey in one platform.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light">
                  <Icon className="text-primary" size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-text">
                  {feature.title}
                </h3>

                <p className="mt-3 text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
