import React from 'react';
import Navbar from '../../components/Navbar';

export const metadata = {
  title: 'Terms of Service | ResumeInsight',
  description: 'Terms of Service for ResumeInsight - Read our terms and conditions for using our resume analysis platform.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing or using ResumeInsight, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Use License</h2>
          <p className="text-slate-600 mb-4">
            Permission is granted to temporarily access the materials (information or software) on ResumeInsight's website for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on ResumeInsight's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Disclaimer</h2>
          <p className="text-slate-600 mb-4">
            The materials on ResumeInsight's website are provided on an 'as is' basis. ResumeInsight makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p className="text-slate-600 mb-4">
            Further, ResumeInsight does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            The AI-generated analysis is for informational purposes only and does not guarantee job placement or interview success.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Limitations</h2>
          <p className="text-slate-600 mb-4">
            In no event shall ResumeInsight or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ResumeInsight's website, even if ResumeInsight or a ResumeInsight authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Subscriptions and Payments</h2>
          <p className="text-slate-600 mb-4">
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
          </p>
          <p className="text-slate-600 mb-4">
            At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or ResumeInsight cancels it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Governing Law</h2>
          <p className="text-slate-600 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
