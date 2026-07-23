'use client';

import { Search, MapPin, BriefcaseBusiness, ArrowRight, CheckCircle2, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-20 lg:py-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-70 blur-[100px]"></div>
      <div className="absolute bottom-10 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-400/15 opacity-60 blur-[80px]"></div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

          <div className="flex flex-col space-y-8 lg:col-span-7">
            {/* Promo Tag */}


            {/* Main Headline */}
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl leading-[1.15]">
              Discover Opportunities.
              <br />
              Apply with Confidence.
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Track Every Step.
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="max-w-xl text-lg text-text-secondary leading-relaxed">
              Find jobs from verified companies, apply easily using your professional profile, and monitor application updates in real time with our intelligent tracker dashboard.
            </p>

            {/* Interactive Search Console */}
            <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-lg shadow-black/[0.03] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 md:flex-row">
              {/* Keyword Search */}
              <div className="relative flex-1 border-b border-border/60 md:border-b-0 md:border-r border-border/60">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  className="w-full bg-transparent py-4 pl-12 pr-4 text-text outline-none placeholder:text-text-muted text-sm"
                />
              </div>

              {/* Location Search */}
              <div className="relative flex-1 border-b border-border/60 md:border-b-0 md:border-r border-border/60">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="City or Remote"
                  className="w-full bg-transparent py-4 pl-12 pr-4 text-text outline-none placeholder:text-text-muted text-sm"
                />
              </div>

              {/* Job Type Dropdown */}
              <div className="relative flex-1 border-b border-border/60 md:border-b-0 md:border-r border-border/60">
                <BriefcaseBusiness className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <select className="w-full cursor-pointer appearance-none bg-transparent py-4 pl-12 pr-8 text-text outline-none text-sm font-medium">
                  <option>Job Type</option>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                  <option>Contract</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-secondary"></div>
              </div>

              {/* Search Trigger Button */}
              <button className="bg-primary px-8 py-4 font-semibold text-text-white transition-all duration-200 hover:bg-primary-hover active:scale-95">
                Search Jobs
              </button>
            </div>

            {/* Popular Skills Badges */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Popular Searches</span>
              <div className="flex flex-wrap gap-2.5">
                {["React", "Next.js", "TypeScript", "Node.js", "Python", "Remote"].map((skill) => (
                  <span
                    key={skill}
                    className="cursor-pointer rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition-all duration-200 hover:border-primary hover:text-primary hover:-translate-y-0.5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row pt-2">
              <Link href="/register/candidate">
                <button className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto rounded-xl border border-border bg-surface px-8 py-4 font-semibold text-text-secondary shadow-sm transition-all duration-200 hover:bg-secondary hover:text-primary">
                  Post a Job
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Dashboard Widget Mockup */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto max-w-md">
              {/* Decorative radial lighting behind widget */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-primary/10 to-blue-500/20 opacity-80 blur-xl"></div>

              {/* Main Tracker Container */}
              <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-2xl backdrop-blur-md">

                {/* Header widget */}
                <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h3 className="font-bold text-text">Application Status</h3>
                    <p className="text-xs text-text-secondary">Google - Senior UI Engineer</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    Active
                  </span>
                </div>

                {/* Tracking Pipeline Steps */}
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 size={18} className="fill-current text-white dark:text-transparent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text">Resume Submitted</h4>
                      <p className="text-xs text-text-secondary">Successfully processed on Oct 14</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 size={18} className="fill-current text-white dark:text-transparent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text">Resume Under Review</h4>
                      <p className="text-xs text-text-secondary">Passed screening match rating of 92%</p>
                    </div>
                  </div>

                  {/* Step 3 (Current / Active) */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-text-white shadow-md shadow-primary/20">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30"></span>
                      <Calendar size={14} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">Interview Scheduled</h4>
                      <p className="text-xs text-text-secondary font-medium">Virtual Loop Panel: Today at 2:00 PM</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4 opacity-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-text-muted">
                      <FileText size={14} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text">Offer Received</h4>
                      <p className="text-xs text-text-secondary">Pending interview results</p>
                    </div>
                  </div>
                </div>

                {/* Overlaid Floating Card 1: Notification Toast */}
                <div className="absolute -left-12 bottom-12 flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-xl backdrop-blur-md animate-bounce duration-1000">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text">Congrats! Hired</h5>
                    <p className="text-[10px] text-text-secondary">Offer accepted for Senior Developer</p>
                  </div>
                </div>

                {/* Overlaid Floating Card 2: Interview reminder */}
                <div className="absolute -right-8 top-16 flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-xl backdrop-blur-md">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <div className="text-xs font-semibold text-text-secondary">
                    Zoom Meeting starts in 15m
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}