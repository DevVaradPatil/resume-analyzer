'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

/**
 * "Start free" for visitors, "Analyze resume" once signed in (DESIGN.md 5.1).
 *
 * A client component on purpose: reading auth on the server would make every
 * page that uses it render per request instead of statically. Visitors are
 * the common case, so that label renders first.
 */
export default function PrimaryCta() {
  const { isSignedIn } = useUser();
  return isSignedIn ? (
    <Link href="/resume-analysis" className="btn btn-primary btn-lg">Analyze resume</Link>
  ) : (
    <Link href="/sign-up" className="btn btn-primary btn-lg">Start free</Link>
  );
}
