'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(`Thank you for subscribing, ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border/60 bg-card/60 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/Nuvora-logo.png"
                alt="Nuvora Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="text-xl font-extrabold text-foreground">
                Nuvora
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Simplify your job application process. Discover jobs, track applications, and manage hiring from one single dashboard.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              For Candidates
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/candidate/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/candidate/companies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore Companies
                </Link>
              </li>
              <li>
                <Link href="/candidate/applied" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Applied Jobs
                </Link>
              </li>
              <li>
                <Link href="/candidate/saved" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Saved Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              For Employers & Company
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/recruiter/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Manage Jobs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-xs text-muted-foreground">
              Get job alerts and updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-border/40 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nuvora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
