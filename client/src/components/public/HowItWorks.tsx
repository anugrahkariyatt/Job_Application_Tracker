'use client';

import { useState } from "react";
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
    description: "Search and filter through positions matching your skillset and interests.",
  },
  {
    icon: UserRound,
    title: "Complete Profile",
    description: "Upload your resume and input your work experience to construct a rich profile.",
  },
  {
    icon: FileCheck,
    title: "Instant Apply",
    description: "Send your profile and cover notes to verified recruiters with one-click submissions.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Application",
    description: "Watch your live status move from under-review to interview and offer notifications.",
  },
];

const recruiterSteps = [
  {
    icon: Building2,
    title: "Establish Profile",
    description: "Set up your corporate verification details to showcase your brand identity.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Publish Roles",
    description: "List full-time, part-time, or remote roles to target qualified professionals.",
  },
  {
    icon: Users,
    title: "Evaluate Talent",
    description: "Read, score, and manage applicant profiles through your HR pipelines.",
  },
  {
    icon: BadgeCheck,
    title: "Finalize Hiring",
    description: "Schedule loops and update statuses to seal negotiations and secure top talent.",
  },
];

export default function HowItWorks() {
  const [activeRole, setActiveRole] = useState<'candidates' | 'recruiters'>('candidates');

  const steps = activeRole === 'candidates' ? candidateSteps : recruiterSteps;

  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            How It Works
          </h2>
          <p className="text-lg text-text-secondary">
            Simplifying employment for candidates and streamline pipelines for recruiters.
          </p>
        </div>

        {/* Stateful Tab Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex rounded-xl bg-background p-1.5 border border-border shadow-sm">
            <button
              onClick={() => setActiveRole('candidates')}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeRole === 'candidates'
                  ? 'bg-primary text-text-white shadow-md shadow-primary/10'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              For Candidates
            </button>
            
            <button
              onClick={() => setActiveRole('recruiters')}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeRole === 'recruiters'
                  ? 'bg-primary text-text-white shadow-md shadow-primary/10'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              For Recruiters
            </button>
          </div>
        </div>

        {/* Steps Horizontal/Vertical Flow Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connector timeline graphics (only on larger displays) */}
          <div className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-0.5 border-t border-dashed border-border/80 -z-0"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="group relative flex flex-col items-center text-center rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md z-10"
              >
                {/* Visual Step Counter Background Badge */}
                <span className="absolute top-4 right-4 text-5xl font-light text-primary/5 select-none transition-colors duration-300 group-hover:text-primary/10">
                  0{index + 1}
                </span>

                {/* Styled Step Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-sm shadow-primary/5 mb-6 transition-transform duration-300 group-hover:scale-105">
                  <Icon size={26} />
                </div>

                {/* Text Contexts */}
                <h4 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                  {step.title}
                </h4>
                
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}