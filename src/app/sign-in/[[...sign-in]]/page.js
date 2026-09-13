import Image from 'next/image';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

// Clerk's form themed with the DESIGN.md tokens (hex, because Clerk reads
// these values in JS rather than from CSS variables).
const appearance = {
  variables: {
    colorPrimary: '#1B6B8F',
    colorText: '#0E1116',
    colorTextSecondary: '#5B6371',
    colorBackground: '#FDFDFE',
    colorInputBackground: '#FDFDFE',
    colorInputText: '#0E1116',
    borderRadius: '10px',
    fontFamily: 'inherit',
  },
  elements: {
    card: 'shadow-none border border-line rounded-panel',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    formButtonPrimary: 'normal-case text-[15px]',
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="" width={28} height={28} />
        <span className="text-lg font-semibold text-ink">ResumeInsight</span>
      </Link>
      <h1 className="mt-8 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
      <p className="mt-2 mb-8 text-ink-2">Pick up where you left off.</p>
      <SignIn appearance={appearance} />
    </div>
  );
}
