'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusChip } from '@/lib/status';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Linkedin,
  Twitter,
  Facebook,
  BadgeCheck,
  Pencil,
  Eye,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noCompany, setNoCompany] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const companyResponse = await axiosInstance.get('/api/company');
        if (companyResponse.data?.success && companyResponse.data?.data) {
          setCompany(companyResponse.data.data);

          // Fetch company's jobs
          try {
            const jobsResponse = await axiosInstance.get('/api/jobs/my-jobs', {
              params: { limit: 1000 }
            });
            if (jobsResponse.data?.success) {
              setJobs(jobsResponse.data.data.jobs);
            }
          } catch (jobErr) {
            console.error('Error fetching company jobs:', jobErr);
          }
        } else {
          setNoCompany(true);
        }
      } catch (err: any) {
        console.error('Error fetching company details:', err);
        if (err.response?.status === 404) {
          setNoCompany(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <Card className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="px-6 pb-6 space-y-4">
            <Skeleton className="h-24 w-24 rounded-xl -mt-12 border-4 border-card" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
        </Card>
      </div>
    );
  }

  if (noCompany) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Building2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Company Profile</h2>
        <p className="text-muted-foreground text-sm">
          You haven't created a company profile yet. Build your company profile so candidates can learn about your workplace and open roles.
        </p>
        <Link
          href="/recruiter/company/edit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover shadow-lg"
        >
          Setup Company Profile
        </Link>
      </div>
    );
  }

  const infoItems = [
    { icon: Building2, label: 'Industry', value: company.industry },
    { icon: Users, label: 'Company Size', value: company.companySize || 'Not specified' },
    { icon: Globe, label: 'Website', value: company.website || 'Not specified', link: company.website },
    { icon: Mail, label: 'Email', value: company.email, link: company.email ? `mailto:${company.email}` : undefined },
    { icon: Phone, label: 'Phone', value: company.phone || 'Not specified' },
    { icon: MapPin, label: 'Headquarters', value: company.headquarters || 'Not specified' },
    { icon: MapPin, label: 'Address', value: company.address || 'Not specified' },
    { icon: Calendar, label: 'Founded', value: company.foundedYear ? String(company.foundedYear) : 'Not specified' },
  ];

  const socials = [
    { icon: Linkedin, label: 'LinkedIn', href: company.linkedin },
    { icon: Twitter, label: 'Twitter', href: company.twitter },
    { icon: Facebook, label: 'Facebook', href: company.facebook },
  ].filter(s => s.href); // Only show links that are actually set

  const activeJobs = jobs.filter((j) => j.status === 'Open');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Your company's public profile page — like a LinkedIn company page."
        breadcrumbs={[{ label: 'Dashboard', href: '/recruiter/dashboard' }, { label: 'Company Profile' }]}
        actions={
          <>
            <Link
              href="/recruiter/company/edit"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="relative h-48 w-full sm:h-56 bg-muted flex items-center justify-center">
          {company.coverImage ? (
            <img
              src={company.coverImage}
              alt="Company cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-1">
              <Building2 className="h-10 w-10 opacity-30" />
              <span className="text-xs font-medium opacity-50">No cover image uploaded</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="px-6 pb-6">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.companyName}
                className="relative z-10 -mt-12 h-24 w-24 rounded-xl border-4 border-card object-cover shadow-md"
              />
            ) : (
              <div className="relative z-10 -mt-12 h-24 w-24 rounded-xl border-4 border-card bg-muted flex items-center justify-center text-muted-foreground font-bold text-2xl shadow-md">
                {company.companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 pb-1 pt-2 sm:pt-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{company.companyName}</h2>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <BadgeCheck className="h-4 w-4" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.industry} {company.headquarters ? `· ${company.headquarters}` : ''} {company.foundedYear ? `· Founded ${company.foundedYear}` : ''}
              </p>
            </div>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {company.description || "No description provided yet. Click Edit Profile to tell candidates about your company!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Briefcase className="h-4.5 w-4.5 text-primary" />
                Active Job Openings ({activeJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <Link
                    key={job._id}
                    href={`/recruiter/jobs/${job._id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.companyName}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm ring-1 ring-border">
                        {company.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.location} · {job.employmentType}
                      </p>
                    </div>
                    <StatusChip status={job.status} />
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No active job postings.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      {item.link && item.value !== 'Not specified' ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm font-medium text-primary hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Company Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <CheckCircle2 className={`h-5 w-5 ${company.verified ? 'text-success' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {company.verified ? 'Verified Company' : 'Pending Verification'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.verified
                      ? 'Your company is verified and trusted by candidates.'
                      : 'Our team is reviewing your profile to verify your company.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
