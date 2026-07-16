import {
  Search,
  UserRound,
  FileCheck,
  ClipboardCheck,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  Users,
} from "lucide-react";

const candidateSteps = [
  {
    icon: Search,
    title: "Discover Jobs",
    description: "Search jobs based on your skills, interests, and preferred location.",
  },
  {
    icon: UserRound,
    title: "Complete Profile",
    description: "Build your professional profile and upload your resume.",
  },
  {
    icon: FileCheck,
    title: "Apply",
    description: "Apply to verified companies with just a few clicks.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Progress",
    description: "Monitor every application with real-time status updates.",
  },
];

const recruiterSteps = [
  {
    icon: Building2,
    title: "Create Company",
    description: "Set up your company profile and verification details.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Post Jobs",
    description: "Publish opportunities to attract qualified candidates.",
  },
  {
    icon: Users,
    title: "Review Applicants",
    description: "View applications and evaluate candidate profiles.",
  },
  {
    icon: BadgeCheck,
    title: "Hire Talent",
    description: "Update application status and hire the right candidate.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-text">
            How It Works
          </h2>

          <p className="mt-4 text-lg text-text-secondary">
            Whether you're searching for your next opportunity or hiring top
            talent, getting started is simple.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Candidate */}

          <div>
            <h3 className="mb-8 text-2xl font-bold text-primary">
              For Candidates
            </h3>

            <div className="space-y-6">
              {candidateSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex gap-5 rounded-2xl border border-border bg-background p-6"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light">
                      <Icon size={26} className="text-primary" />
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-primary">
                        Step {index + 1}
                      </span>

                      <h4 className="mt-1 text-xl font-semibold text-text">
                        {step.title}
                      </h4>

                      <p className="mt-2 text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recruiter */}

          <div>
            <h3 className="mb-8 text-2xl font-bold text-primary">
              For Recruiters
            </h3>

            <div className="space-y-6">
              {recruiterSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex gap-5 rounded-2xl border border-border bg-background p-6"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light">
                      <Icon size={26} className="text-primary" />
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-primary">
                        Step {index + 1}
                      </span>

                      <h4 className="mt-1 text-xl font-semibold text-text">
                        {step.title}
                      </h4>

                      <p className="mt-2 text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}