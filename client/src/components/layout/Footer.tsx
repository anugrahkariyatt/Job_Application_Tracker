'use client';

import Link from 'next/link';
import { BriefcaseBusiness, Mail, Linkedin, Twitter, Github, Globe } from 'lucide-react';
import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing, ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border/60 bg-surface/50 py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/Nuvora-logo.png"
                alt="Nuvora Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                Nuvora
              </span>
            </Link>
            <p className="max-w-xs text-sm text-text-secondary leading-relaxed">
              Simplify your job application process. Discover, apply, and monitor all your job opportunities from a single, organized dashboard.
            </p>
            <div className="flex gap-4">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-all duration-200 hover:border-primary hover:text-primary" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-all duration-200 hover:border-primary hover:text-primary" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-all duration-200 hover:border-primary hover:text-primary" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-all duration-200 hover:border-primary hover:text-primary" aria-label="Website">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
              For Candidates
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/jobs" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register/candidate" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Create Candidate Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Application Tracker
                </Link>
              </li>

              <li>
                <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Career Advice
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
              For Employers
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/register/recruiter" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Talent Sourcing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-xs text-text-secondary">
              Get weekly job alert digests and hiring insights directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-text-white shadow-md shadow-primary/10 transition-all duration-200 hover:bg-primary-hover hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Nuvora. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-text-muted">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
