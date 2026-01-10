'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FileText, LayoutDashboard } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();

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

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ResumeInsight Logo" width={32} height={32} />
            <span className="text-xl font-bold md:flex hidden text-slate-800">ResumeInsight</span>
          </Link>

          {/* Navigation */}
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

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link
                href="/dashboard"
                className={`hidden sm:flex items-center gap-2 px-4 py-2 transition-colors ${
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
                className="px-4 py-2  text-slate-600 hover:text-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2  bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
