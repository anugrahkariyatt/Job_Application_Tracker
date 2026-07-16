import {
  BriefcaseBusiness,
  MapPin,
  Clock3,
  ArrowRight,
} from "lucide-react";

const jobs = [
  {
    title: "Frontend Developer",
    company: "Google",
    location: "Bangalore",
    type: "Full Time",
  },
  {
    title: "Backend Developer",
    company: "Microsoft",
    location: "Hyderabad",
    type: "Remote",
  },
  {
    title: "UI/UX Designer",
    company: "Adobe",
    location: "Remote",
    type: "Full Time",
  },
  {
    title: "MERN Stack Developer",
    company: "Netflix",
    location: "Chennai",
    type: "Internship",
  },
  {
    title: "DevOps Engineer",
    company: "Amazon",
    location: "Pune",
    type: "Full Time",
  },
  {
    title: "AI Engineer",
    company: "OpenAI",
    location: "Remote",
    type: "Contract",
  },
];

export default function FeaturedJobs() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-text">
            Featured Opportunities
          </h2>

          <p className="mt-4 text-lg text-text-secondary">
            Explore opportunities from verified companies hiring talented
            professionals.
          </p>
        </div>

        {/* Jobs */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={`${job.company}-${job.title}`}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
                  {job.type}
                </span>

                <BriefcaseBusiness
                  size={24}
                  className="text-primary"
                />
              </div>

              <h3 className="text-2xl font-semibold text-text">
                {job.title}
              </h3>

              <p className="mt-2 text-text-secondary">
                {job.company}
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-2 text-text-muted">
                  <Clock3 size={18} />
                  <span>{job.type}</span>
                </div>
              </div>

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-text-white transition hover:bg-primary-hover">
                Apply Now

                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Button */}

        <div className="mt-14 text-center">
          <button className="rounded-xl border border-primary bg-surface px-8 py-4 font-semibold text-primary transition hover:bg-primary-light">
            Browse All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}