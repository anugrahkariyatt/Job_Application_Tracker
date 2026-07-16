export default function Hero() {
  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        {/* Heading */}
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-text md:text-6xl">
          Discover Opportunities.
          <br />
          Apply with Confidence.
          <br />
          Track Every Step.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
          Find jobs from trusted companies, apply using your professional
          profile, and stay informed with real-time application updates—all in
          one organized platform.
        </p>

        {/* Search */}
        <div className="mt-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-md md:flex-row">
          <input
            type="text"
            placeholder="Job title, skill or company"
            className="flex-1 border-b border-border bg-surface px-6 py-4 text-text placeholder:text-text-muted md:border-b-0 md:border-r"
          />

          <input
            type="text"
            placeholder="City or Remote"
            className="flex-1 border-b border-border bg-surface px-6 py-4 text-text placeholder:text-text-muted md:border-b-0 md:border-r"
          />

          <select className="border-b border-border bg-surface px-6 py-4 text-text md:border-b-0 md:border-r">
            <option>Job Type</option>
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Internship</option>
            <option>Remote</option>
            <option>Contract</option>
          </select>

          <button className="bg-primary px-8 py-4 font-semibold text-text-white transition hover:bg-primary-hover">
            Search Jobs
          </button>
        </div>

        {/* Skills */}
        <div className="mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
          {[
            "React",
            "Next.js",
            "Node.js",
            "TypeScript",
            "Java",
            "Python",
            "Frontend",
            "Backend",
            "Full Stack",
            "Remote",
            "Internship",
            "AI",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition hover:border-primary hover:text-primary"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="rounded-xl bg-primary px-8 py-4 font-semibold text-text-white transition hover:bg-primary-hover">
            Get Started
          </button>

          <button className="rounded-xl border border-primary bg-surface px-8 py-4 font-semibold text-primary transition hover:bg-primary-light">
            Post a Job
          </button>
        </div>
      </div>
    </section>
  );
}