import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { ClerkProvider } from '@clerk/nextjs';
import { structuredData, organizationData } from '../lib/structured-data';
import Footer from '../components/Footer';
import SubscriptionProvider from '../components/SubscriptionProvider';
import { AdProvider } from '../components/ads';
import Script from 'next/script';

// Geist is a variable font, so no weight list is needed.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://resumeinsight.vercel.app'),
  title: {
    default: 'Resume Analyzer - AI-Powered Resume Enhancement | ResumeInsight',
    template: '%s | ResumeInsight',
  },
  description: "Check your resume against a job description. Get a match score, the keywords you are missing, ATS feedback, and rewrites you can paste in.",
  keywords: [
    'resume analyzer',
    'AI resume checker',
    'resume optimization',
    'job application',
    'resume enhancement',
    'ATS resume scanner',
    'career development',
    'resume feedback',
    'CV analyzer',
    'job search tools'
  ],
  authors: [{ name: 'ResumeInsight' }],
  creator: 'ResumeInsight',
  publisher: 'ResumeInsight',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Resume Analyzer - AI-Powered Resume Enhancement | ResumeInsight',
    description: 'Get a match score, the keywords you are missing, ATS feedback, and rewrites you can paste in.',
    url: 'https://resumeinsight.vercel.app',
    siteName: 'ResumeInsight',
    images: [
      {
        url: '/assets/product/og.png',
        width: 1200,
        height: 630,
        alt: 'ResumeInsight - AI-Powered Resume Analyzer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Analyzer - AI-Powered Resume Enhancement',
    description: 'A match score, missing keywords, and rewrites for your resume.',
    images: ['/assets/product/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
          colorText: '#1e293b',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1e293b',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/resume-analysis"
      afterSignUpUrl="/resume-analysis"
    >
      {/* Font variables live on <html>: --font-sans is declared on :root as
          var(--font-geist), and would resolve to nothing if the variable were
          only defined further down the tree on <body>. */}
      <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationData),
            }}
          />
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
        </head>
        <body
          className="font-sans antialiased min-h-screen flex flex-col"
        >
          <SubscriptionProvider>
            <AdProvider>
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </AdProvider>
          </SubscriptionProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
