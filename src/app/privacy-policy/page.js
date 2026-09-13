import LegalPage from '../../components/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ResumeInsight - Learn how we collect, use, and protect your personal information.',
};

const SECTIONS = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'data-we-collect', title: '2. Data We Collect' },
  { id: 'how-we-use-your-data', title: '3. How We Use Your Data' },
  { id: 'data-security', title: '4. Data Security' },
  { id: 'third-party-services', title: '5. Third-Party Services' },
  { id: 'data-retention', title: '6. Data Retention' },
  { id: 'your-rights-and-deleting-your-data', title: '7. Your Rights and Deleting Your Data' },
  { id: 'contact-us', title: '8. Contact Us' },
];

// Date of the last change to the wording below, not the build date.
const LAST_UPDATED = '2026-09-13';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED} sections={SECTIONS}>
      <section id="introduction">
        <h2>1. Introduction</h2>
        <p>
          Welcome to ResumeInsight ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </p>
      </section>

      <section id="data-we-collect">
        <h2>2. Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
        </p>
        <ul>
          <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data:</strong> includes email address.</li>
          <li><strong>Content Data:</strong> includes the resumes/CVs you upload for analysis.</li>
          <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
          <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
        </ul>
      </section>

      <section id="how-we-use-your-data">
        <h2>3. How We Use Your Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul>
          <li>To provide the resume analysis service you requested.</li>
          <li>To manage your account and subscription.</li>
          <li>To improve our website and services.</li>
          <li>To send you service-related emails (e.g., account verification, order confirmations, changes/updates to features of the Service, technical and security notices).</li>
        </ul>
      </section>

      <section id="data-security">
        <h2>4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
          In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
        </p>
      </section>

      <section id="third-party-services">
        <h2>5. Third-Party Services</h2>
        <p>
          We use third-party services for various functions:
        </p>
        <ul>
          <li><strong>Authentication:</strong> We use Clerk for user authentication.</li>
          <li><strong>Payments:</strong> We use Razorpay for processing payments. We do not store your payment card details.</li>
          <li><strong>AI Analysis:</strong> We use Google Gemini API for resume analysis. Data sent to AI providers is used solely for the purpose of generating the analysis.</li>
          <li><strong>Database:</strong> We use Supabase for data storage.</li>
        </ul>
      </section>

      <section id="data-retention">
        <h2>6. Data Retention</h2>
        <p>
          We keep your uploaded resumes and their analysis results so that you can
          revisit them from your dashboard. We retain them for <strong>12 months</strong> from
          the date the analysis was created, after which they are deleted automatically.
        </p>
        <p>
          We keep limited technical logs of each analysis (which AI model was used, how
          long it took, and whether it succeeded) for the same period. These logs do not
          contain the text of your resume.
        </p>
        <p>
          Records of payments are retained for longer where we are required to keep them
          for tax and accounting purposes.
        </p>
      </section>

      <section id="your-rights-and-deleting-your-data">
        <h2>7. Your Rights and Deleting Your Data</h2>
        <p>
          You can delete your data at any time, without contacting us:
        </p>
        <ul>
          <li>
            <strong>Delete a single analysis:</strong> on your dashboard, open the menu (⋯)
            next to any report under Recent reports and choose Delete.
          </li>
          <li>
            <strong>Delete everything:</strong> use “Delete all my data” in the Your data
            section of your dashboard. This permanently removes all stored resumes and
            analysis history. Your account remains active.
          </li>
          <li>
            <strong>Delete your account:</strong> deleting your account also deletes all
            associated resumes and analyses.
          </li>
        </ul>
        <p>
          Deletions are immediate and cannot be undone. Depending on where you live, you
          may also have rights to access, correct, or export your personal data, and to
          object to or restrict its processing. Contact us to exercise any of these.
        </p>
      </section>

      <section id="contact-us">
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact us.
        </p>
      </section>
    </LegalPage>
  );
}
