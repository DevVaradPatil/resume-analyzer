'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useModalA11y } from "../hooks/useModalA11y";

const NAV_LINKS = [
  { href: "/resume-analysis", label: "Job match" },
  { href: "/analytics", label: "Analytics" },
  { href: "/section-improvement", label: "Improve" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const USER_BUTTON_APPEARANCE = { elements: { avatarBox: "w-8 h-8" } };

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The mobile menu behaves as a modal: Escape, focus trap, focus restore and
  // scroll lock all come from the shared hook.
  const menuRef = useModalA11y(isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href) =>
    `transition-colors ${isActive(href) ? "text-ink" : "text-ink-3 hover:text-ink"}`;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-canvas border-b border-line">
        <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.svg" alt="" width={28} height={28} />
            <span className="text-[17px] font-semibold tracking-tight text-ink">ResumeInsight</span>
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-7 text-[15px] font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <SignedIn>
              <Link
                href="/dashboard"
                aria-current={isActive("/dashboard") ? "page" : undefined}
                className="btn btn-ghost"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" appearance={USER_BUTTON_APPEARANCE} />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="btn btn-ghost">Sign in</Link>
              <Link href="/sign-up" className="btn btn-primary">Start free</Link>
            </SignedOut>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <SignedOut>
              <Link href="/sign-up" className="btn btn-primary h-9 px-3.5 text-sm">Start free</Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={USER_BUTTON_APPEARANCE} />
            </SignedIn>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="btn btn-ghost h-9 w-9 px-0"
            >
              {isMenuOpen ? <X size={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered only while open, so its links are not tabbable when hidden. */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-canvas overflow-y-auto outline-none animate-fadeIn"
        >
          <nav aria-label="Mobile" className="flex flex-col px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`py-3.5 text-lg font-medium border-b border-line ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}

            <SignedIn>
              <Link
                href="/dashboard"
                aria-current={isActive("/dashboard") ? "page" : undefined}
                className={`py-3.5 text-lg font-medium border-b border-line ${linkClass("/dashboard")}`}
              >
                Dashboard
              </Link>
            </SignedIn>

            <SignedOut>
              <div className="grid gap-3 pt-6">
                <Link href="/sign-up" className="btn btn-primary btn-lg w-full">Start free</Link>
                <Link href="/sign-in" className="btn btn-secondary btn-lg w-full">Sign in</Link>
              </div>
            </SignedOut>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
