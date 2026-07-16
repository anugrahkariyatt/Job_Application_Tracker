import { ArrowRight, Building2, MapPin, BadgeCheck } from "lucide-react";

const companies = [
  {
    name: "Google",
    industry: "Technology",
    location: "Bangalore",
    verified: true,
  },
  {
    name: "Microsoft",
    industry: "Cloud Computing",
    location: "Hyderabad",
    verified: true,
  },
  {
    name: "Adobe",
    industry: "Software",
    location: "Noida",
    verified: true,
  },
  {
    name: "Netflix",
    industry: "Entertainment",
    location: "Remote",
    verified: true,
  },
  {
    name: "Spotify",
    industry: "Music",
    location: "Remote",
    verified: true,
  },
  {
    name: "Amazon",
    industry: "E-Commerce",
    location: "Chennai",
    verified: true,
  },
];

export default function FeaturedCompanies() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-text">
            Trusted Companies Hiring Now
          </h2>

          <p className="mt-4 text-lg text-text-secondary">
            Explore verified companies actively looking for talented
            professionals.
          </p>
        </div>

        {/* Company Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.name}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light">
                  <Building2 className="text-primary" size={28} />
                </div>

                {company.verified && (
                  <BadgeCheck
                    className="text-success"
                    size={24}
                  />
                )}
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-text">
                {company.name}
              </h3>

              <p className="mt-2 text-text-secondary">
                {company.industry}
              </p>

              <div className="mt-5 flex items-center gap-2 text-text-muted">
                <MapPin size={18} />
                <span>{company.location}</span>
              </div>

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-surface py-3 font-semibold text-primary transition hover:bg-primary-light">
                Explore Company

                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Button */}

        <div className="mt-14 text-center">
          <button className="rounded-xl bg-primary px-8 py-4 font-semibold text-text-white transition hover:bg-primary-hover">
            View All Companies
          </button>
        </div>
      </div>
    </section>
  );
}