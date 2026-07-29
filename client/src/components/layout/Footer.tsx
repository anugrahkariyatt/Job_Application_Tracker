'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/60 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
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
