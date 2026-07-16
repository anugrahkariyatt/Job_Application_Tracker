"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-primary"
          onClick={closeMenu}
        >
          Logo
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <Link
              href="/jobs"
              className="font-medium text-text hover:text-primary"
            >
              Jobs
            </Link>
          </li>

          <li>
            <Link
              href="/companies"
              className="font-medium text-text hover:text-primary"
            >
              Companies
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className="font-medium text-text hover:text-primary"
            >
              About
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className="font-medium text-text hover:text-primary"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-5 py-2 font-medium text-text transition hover:text-primary"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-primary px-5 py-2 font-medium text-white transition hover:bg-primary-hover"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-border bg-white shadow-lg md:hidden">
          <ul className="flex flex-col px-6 py-4">
            <li className="border-b border-border py-4">
              <Link href="/jobs" onClick={closeMenu}>
                Jobs
              </Link>
            </li>

            <li className="border-b border-border py-4">
              <Link href="/companies" onClick={closeMenu}>
                Companies
              </Link>
            </li>

            <li className="border-b border-border py-4">
              <Link href="/about" onClick={closeMenu}>
                About
              </Link>
            </li>

            <li className="border-b border-border py-4">
              <Link href="/contact" onClick={closeMenu}>
                Contact
              </Link>
            </li>

            <li className="pt-6">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-lg border border-primary px-4 py-3 text-center font-medium text-primary"
              >
                Log In
              </Link>
            </li>

            <li className="pt-4">
              <Link
                href="/register"
                onClick={closeMenu}
                className="block w-full rounded-lg bg-primary px-4 py-3 text-center font-medium text-white"
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
