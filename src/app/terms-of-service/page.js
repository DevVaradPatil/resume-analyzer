import LegalPage from '../../components/LegalPage';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for ResumeInsight - Read our terms and conditions for using our resume analysis platform.',
};

const SECTIONS = [
  { id: 'agreement-to-terms', title: '1. Agreement to Terms' },
  { id: 'use-license', title: '2. Use License' },
  { id: 'disclaimer', title: '3. Disclaimer' },
  { id: 'limitations', title: '4. Limitations' },
  { id: 'plans-and-payments', title: '5. Plans and Payments' },
  { id: 'governing-law', title: '6. Governing Law' },
];

// Date of the last change to the wording below, not the build date.
const LAST_UPDATED = '2026-09-13';

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" lastUpdated={LAST_UPDATED} sections={SECTIONS}>
      <section id="agreement-to-terms">
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using ResumeInsight, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section id="use-license">
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily access the materials (information or software) on ResumeInsight's website for personal, non-commercial transitory viewing only.
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>attempt to decompile or reverse engineer any software contained on ResumeInsight's website;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
      </section>

      <section id="disclaimer">
        <h2>3. Disclaimer</h2>
        <p>
          The materials on ResumeInsight's website are provided on an 'as is' basis. ResumeInsight makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p>
          Further, ResumeInsight does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
          The AI-generated analysis is for informational purposes only and does not guarantee job placement or interview success.
        </p>
      </section>

      <section id="limitations">
        <h2>4. Limitations</h2>
        <p>
          In no event shall ResumeInsight or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ResumeInsight's website, even if ResumeInsight or a ResumeInsight authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>
      </section>

      <section id="plans-and-payments">
        <h2>5. Plans and Payments</h2>
        <p>
          ResumeInsight offers a free plan and paid plans. A paid plan is a one-time purchase that gives you that plan's
          monthly limits for 30 days from the moment your payment is confirmed. Prices are shown in Indian rupees before
          you pay.
        </p>
        <p>
          Paid plans do not renew automatically. You will not be charged again unless you choose to buy another plan.
          If you buy the same plan again while it is still active, 30 days are added to its current end date. When a paid
          plan ends, your account returns to the free plan.
        </p>
        <p>
          Payments are processed by Razorpay. ResumeInsight does not store your card or bank account details.
        </p>
      </section>

      <section id="governing-law">
        <h2>6. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>
      </section>
    </LegalPage>
  );
}
