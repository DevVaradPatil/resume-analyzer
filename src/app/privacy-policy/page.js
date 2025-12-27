import React from 'react';
import Navbar from '../../components/Navbar';

export const metadata = {
  title: 'Privacy Policy | ResumeInsight',
  description: 'Privacy Policy for ResumeInsight - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Introduction</h2>
          <p className="text-slate-600 mb-4">
            Welcome to ResumeInsight ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Data We Collect</h2>
          <p className="text-slate-600 mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address.</li>
            <li><strong>Content Data:</strong> includes the resumes/CVs you upload for analysis.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">3. How We Use Your Data</h2>
          <p className="text-slate-600 mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>To provide the resume analysis service you requested.</li>
            <li>To manage your account and subscription.</li>
            <li>To improve our website and services.</li>
            <li>To send you service-related emails (e.g., account verification, order confirmations, changes/updates to features of the Service, technical and security notices).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Data Security</h2>
          <p className="text-slate-600 mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Third-Party Services</h2>
          <p className="text-slate-600 mb-4">
            We use third-party services for various functions:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>Authentication:</strong> We use Clerk for user authentication.</li>
            <li><strong>Payments:</strong> We use Razorpay for processing payments. We do not store your payment card details.</li>
            <li><strong>AI Analysis:</strong> We use Google Gemini API for resume analysis. Data sent to AI providers is used solely for the purpose of generating the analysis.</li>
            <li><strong>Database:</strong> We use Supabase for data storage.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
          <p className="text-slate-600 mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
