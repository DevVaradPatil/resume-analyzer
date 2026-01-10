'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/resume-analysis", label: "Analyze" },
    { href: "/analytics", label: "Analytics" },
    { href: "/section-improvement", label: "Improve" },
    { href: "/blog", label: "Blog" },
  ];

  const isActive = (href) => {
    if (href === "/blog") {
      return pathname === "/blog" || pathname.startsWith("/blog/");
    }
    return pathname === href;
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-50">
              <Image src="/logo.svg" alt="ResumeInsight Logo" width={32} height={32} />
              <span className="text-xl font-bold hidden sm:flex text-slate-800">ResumeInsight</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors font-medium ${
                    isActive(link.href)
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9"
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </SignedOut>
            </div>

            {/* Mobile Menu Button & User Button */}
            <div className="flex md:hidden items-center gap-3">
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9"
                    }
                  }}
                />
              </SignedIn>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-800 transition-colors z-50"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-[73px] right-0 h-[calc(100vh-73px)] w-64 bg-white shadow-2xl z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-6 gap-2">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dashboard Link (Signed In) */}
          <SignedIn>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </SignedIn>

          {/* Auth Buttons (Signed Out) */}
          <SignedOut>
            <div className="pt-4 border-t border-slate-200 mt-4 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-3 text-center text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </SignedOut>
        </nav>
      </div>
    </>
  );
};

export default Navbar;