'use client';

import { useState, useEffect } from 'react';
import {
  BriefcaseBusiness,
  MapPin,
  Clock3,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/jobs');
        if (response.data?.success) {
          // Limit to first 6 jobs for the featured section
          setJobs(response.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching public featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

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

        {/* Jobs List / Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading latest opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-background">
            <p className="text-text-secondary font-medium">No open positions available right now.</p>
            <p className="text-sm text-text-muted mt-1">Check back later or register to get notified!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const companyName = job.companyId?.companyName || 'Verified Company';
              const logo = job.companyId?.logo;

              return (
                <div
                  key={job._id}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
                      {job.employmentType}
                    </span>
                    {logo ? (
                      <img
                        src={logo}
                        alt={companyName}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
                      />
                    ) : (
                      <BriefcaseBusiness
                        size={24}
                        className="text-primary"
                      />
                    )}
                  </div>

                  <h3 className="text-2xl font-semibold text-text line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="mt-2 text-text-secondary font-medium">
                    {companyName}
                  </p>

                  <div className="mt-5 space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-text-muted">
                      <MapPin size={18} />
                      <span className="text-sm">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-text-muted">
                      <Clock3 size={18} />
                      <span className="text-sm">
                        {job.remote ? 'Remote' : 'Onsite'}
                      </span>
                    </div>
                  </div>

                  <Link href="/login" className="mt-8">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-text-white transition hover:bg-primary-hover">
                      Apply Now
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse all button */}
        <div className="mt-14 text-center">
          <Link href="/login">
            <button className="rounded-xl border border-primary bg-surface px-8 py-4 font-semibold text-primary transition hover:bg-primary-light">
              Browse All Jobs
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}