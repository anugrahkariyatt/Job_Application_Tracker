"use client";

import Link from "next/link";
import { Menu, X, BriefcaseBusiness } from "lucide-react";
import { useState } from "react";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Styled Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          onClick={closeMenu}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-text-white shadow-md shadow-primary/20">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Techno Careers
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {[
            { label: "Candidate", href: "/register/candidate" },
            { label: "Company", href: "/register/recruiter" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="relative py-2 font-medium text-text-secondary transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-5 py-2.5 font-semibold text-text-secondary transition-all hover:bg-secondary hover:text-primary"
          >
            Log In
          </Link>

          <Link
            href="/register/candidate"
            className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-text-white shadow-md shadow-primary/10 transition-all hover:bg-primary-hover hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-xl p-2 text-text-secondary hover:bg-secondary md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-md shadow-xl md:hidden animate-in fade-in slide-in-from-top duration-200">
          <ul className="flex flex-col px-6 py-6 space-y-2">
            {[
              { label: "Candidate", href: "/register/candidate" },
              { label: "Company", href: "/register/recruiter" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 font-medium text-text-secondary hover:bg-secondary hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="pt-6 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-xl border border-border px-4 py-3 text-center font-semibold text-text-secondary hover:bg-secondary transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register/candidate"
                onClick={closeMenu}
                className="block w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-text-white shadow-md shadow-primary/10 hover:bg-primary-hover transition-all"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
