const stats = [
  {
    value: "10,000+",
    label: "Active Jobs",
  },
  {
    value: "2,500+",
    label: "Verified Companies",
  },
  {
    value: "50,000+",
    label: "Candidates",
  },
  {
    value: "100,000+",
    label: "Applications",
  },
];

export default function Statistics() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-text">
            Trusted by professionals building their careers
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Discover opportunities, apply with confidence, and manage your
            career journey from one organized platform.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-4xl font-bold text-primary">
                {item.value}
              </h3>

              <p className="mt-3 text-base font-medium text-text-secondary">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}