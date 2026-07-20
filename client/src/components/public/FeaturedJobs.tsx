'use client';

import { useState, useEffect } from 'react';
import {
  BriefcaseBusiness,
  MapPin,
  Clock3,
  ArrowRight,
  Loader2,
  DollarSign,
  Building2,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';

// Detailed fallbacks for mock jobs to guarantee a premium look if API returns empty
const MOCK_JOBS = [
  {
    _id: 'mock-1',
    title: 'Senior Software Engineer, Core Systems',
    employmentType: 'Full-time',
    location: 'Bangalore, KA',
    remote: true,
    salaryRange: '$120,000 - $150,000',
    tags: ['Next.js', 'Go', 'Kubernetes'],
    companyId: {
      companyName: 'Google Cloud Services',
      logo: '',
    },
  },
  {
    _id: 'mock-2',
    title: 'Senior Product Designer',
    employmentType: 'Full-time',
    location: 'Remote (APAC)',
    remote: true,
    salaryRange: '$90,000 - $120,000',
    tags: ['Figma', 'UX Research', 'Design Systems'],
    companyId: {
      companyName: 'Spotify',
      logo: '',
    },
  },
  {
    _id: 'mock-3',
    title: 'Frontend Engineer (React)',
    employmentType: 'Contract',
    location: 'Hyderabad, TS',
    remote: false,
    salaryRange: '$80,000 - $110,000',
    tags: ['React', 'TypeScript', 'Tailwind'],
    companyId: {
      companyName: 'Netflix',
      logo: '',
    },
  },
  {
    _id: 'mock-4',
    title: 'Staff Machine Learning Engineer',
    employmentType: 'Full-time',
    location: 'Noida, UP',
    remote: false,
    salaryRange: '$160,000 - $210,000',
    tags: ['PyTorch', 'Python', 'LLMs'],
    companyId: {
      companyName: 'Adobe Systems',
      logo: '',
    },
  },
  {
    _id: 'mock-5',
    title: 'DevOps & Infrastructure Architect',
    employmentType: 'Full-time',
    location: 'Chennai, TN',
    remote: true,
    salaryRange: '$115,000 - $140,000',
    tags: ['AWS', 'Terraform', 'Docker'],
    companyId: {
      companyName: 'Amazon Development',
      logo: '',
    },
  },
  {
    _id: 'mock-6',
    title: 'Content Marketing Specialist',
    employmentType: 'Part-time',
    location: 'Mumbai, MH',
    remote: true,
    salaryRange: '$50,000 - $70,000',
    tags: ['SEO', 'Copywriting', 'Analytics'],
    companyId: {
      companyName: 'Microsoft Tech',
      logo: '',
    },
  },
];

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/jobs');
        if (response.data?.success && response.data.data?.length > 0) {
          setJobs(response.data.data.slice(0, 6));
        } else {
          // Use high quality fallback mockup if empty response
          setJobs(MOCK_JOBS);
        }
      } catch (err) {
        console.error('Error fetching public featured jobs, using fallback mockup:', err);
        setJobs(MOCK_JOBS);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Featured Opportunities
          </h2>
          <p className="text-lg text-text-secondary">
            Explore active high-paying openings from verified industry giants.
          </p>
        </div>

        {/* Loading / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching the latest opportunities...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const companyName = job.companyId?.companyName || 'Verified Corporate Partner';
              const logo = job.companyId?.logo;
              const salary = job.salaryRange || '$85k - $120k'; // Fallback display salary range
              const tags = job.tags || ['Tech', 'Design', 'Full-time'];

              return (
                <div
                  key={job._id}
                  className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20"
                >
                  <div>
                    {/* Header: Badges & Logo */}
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-primary-light px-3.5 py-1 text-xs font-semibold text-primary">
                        {job.employmentType}
                      </span>
                      {logo ? (
                        <img
                          src={logo}
                          alt={companyName}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                          <Building2 size={20} />
                        </div>
                      )}
                    </div>

                    {/* Job Details */}
                    <h3 className="text-xl font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-text-secondary">
                      {companyName}
                    </p>

                    {/* Skill Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((tag: string) => (
                        <span key={tag} className="rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Metadata: Location, Salary, Onsite/Remote */}
                    <div className="mt-6 space-y-2.5 border-t border-border/40 pt-4">
                      <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                        <MapPin size={16} className="text-text-muted" />
                        <span>{job.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                        <Clock3 size={16} className="text-text-muted" />
                        <span>{job.remote ? 'Remote' : 'Onsite'}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-text-secondary text-sm font-medium">
                        <DollarSign size={16} className="text-text-muted" />
                        <span>{salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply CTA Button */}
                  <Link href="/login" className="mt-8">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]">
                      Apply Now
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse all button */}
        <div className="mt-16 text-center">
          <Link href="/login">
            <button className="inline-flex items-center gap-2.5 rounded-xl border border-primary bg-transparent px-8 py-4 font-semibold text-primary transition-all duration-200 hover:bg-primary-light hover:-translate-y-0.5 active:translate-y-0">
              Browse All Jobs
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}