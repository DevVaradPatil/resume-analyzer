import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { ClerkProvider } from '@clerk/nextjs';
import { structuredData, organizationData } from '../lib/structured-data';
import Footer from '../components/Footer';
import SubscriptionProvider from '../components/SubscriptionProvider';
import { AdProvider } from '../components/ads';
import { ADSENSE_PUBLISHER_ID, AD_CONFIG } from '../lib/adsense-config';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Resume Analyzer - AI-Powered Resume Enhancement | ResumeInsight",
  description: "Transform your job application process with precision AI analysis. Get personalized insights, close skill gaps, and stand out to recruiters with an optimized resume that gets results.",
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
  metadataBase: new URL('https://resumeinsight.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Resume Analyzer - AI-Powered Resume Enhancement | ResumeInsight',
    description: 'Transform your job application process with precision AI analysis. Get personalized insights, close skill gaps, and stand out to recruiters.',
    url: 'https://resumeinsight.vercel.app',
    siteName: 'ResumeInsight',
    images: [
      {
        url: '/assets/landing.png',
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
    description: 'Transform your job application process with precision AI analysis.',
    images: ['/assets/landing.png'],
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
      <html lang="en">
        <head>
          {/* Google AdSense Script - Only load if ads are enabled */}
          {AD_CONFIG.enabled && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
              crossOrigin="anonymous"
            />
          )}
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
        </head>
        <body
          className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}
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
