'use client';

import React, { useId, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import UpgradeModal from '../../components/UpgradeModal';
import ToolLayout, { toFriendlyError } from '../../components/ToolLayout';
import AnalysisProgress, { SECTION_IMPROVEMENT_STAGES } from '../../components/AnalysisProgress';
import SectionImprovementResults from '../../components/results/SectionImprovementResults';

const SECTION_TYPES = [
  {
    id: 'summary',
    name: 'Summary',
    description: 'A brief overview of your professional experience and goals.',
    placeholder:
      'Experienced software developer with 5+ years of experience in full-stack development...',
  },
  {
    id: 'experience',
    name: 'Experience',
    description: 'One role, or a few bullet points from it.',
    placeholder:
      'Software Engineer at TechCorp\n• Developed web applications using React and Node.js\n• Collaborated with cross-functional teams...',
  },
  {
    id: 'skills',
    name: 'Skills',
    description: 'Technical and soft skills, as listed on your resume.',
    placeholder:
      'Programming Languages: JavaScript, Python, Java\nFrameworks: React, Angular, Django\nDatabases: MySQL, MongoDB...',
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Degrees, coursework and academic achievements.',
    placeholder:
      'Bachelor of Science in Computer Science\nUniversity of Technology, 2020\nRelevant Coursework: Data Structures, Algorithms...',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Personal or professional project descriptions.',
    placeholder:
      'E-commerce Platform\n• Built a full-stack e-commerce application using MERN stack\n• Implemented payment processing with Stripe...',
  },
];

const INCLUDES = [
  { title: 'A rewrite you can copy', detail: 'Shown next to your original so you can compare line by line.' },
  { title: 'What changed and why', detail: 'Each change with the reason behind it.' },
  { title: 'Alternative versions', detail: 'Different takes on the same section, to pick from.' },
  { title: 'Keywords to consider', detail: 'Terms that help screening software find you.' },
];

export default function SectionImprovementPage() {
  const [selectedSection, setSelectedSection] = useState('summary');
  const [originalText, setOriginalText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);
  const lastRun = useRef(null);

  const radioName = useId();
  const textareaId = useId();
  const helpId = useId();

  const handleImprovement = async (sectionType = selectedSection, text = originalText) => {
    if (!text.trim()) return;
    lastRun.current = [sectionType, text];

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/improve-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: sectionType,
          original_text: text,
        }),
      });

      const data = await response.json();

      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'improve',
          tier: data.tier,
          used: data.used,
          remaining: data.remaining,
          limit: data.limit,
          resetDate: data.resetDate,
        });
        setShowUpgradeModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.status === 'error') {
        throw new Error(data.error || 'Server error occurred');
      }

      setSubmittedText(text);
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(toFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedInfo = SECTION_TYPES.find((s) => s.id === selectedSection);

  const input = (
    <form
      className="panel p-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleImprovement();
      }}
    >
      {/* Native radios: arrow keys and screen readers work without custom code. */}
      <fieldset>
        <legend className="mb-3 text-[13px] font-medium text-ink">Section</legend>
        <div className="flex flex-wrap gap-2">
          {SECTION_TYPES.map((section) => (
            <label
              key={section.id}
              className={`relative inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                selectedSection === section.id
                  ? 'bg-accent-soft text-accent shadow-[inset_0_0_0_1.5px_var(--color-accent)]'
                  : 'bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-sunken'
              }`}
            >
              <input
                type="radio"
                name={radioName}
                value={section.id}
                checked={selectedSection === section.id}
                onChange={() => setSelectedSection(section.id)}
                className="sr-only"
              />
              {section.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor={textareaId} className="mt-6 block text-[13px] font-medium text-ink">
        Text to improve
      </label>
      <p id={helpId} className="mt-1 text-sm text-ink-3">{selectedInfo.description}</p>
      <textarea
        id={textareaId}
        aria-describedby={helpId}
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder={selectedInfo.placeholder}
        rows={9}
        className="field mt-3 resize-y"
      />

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-sm text-ink-3 tabular-nums">{originalText.length} characters</span>
        <button
          type="submit"
          disabled={!originalText.trim() || isLoading}
          className="btn btn-primary"
        >
          {isLoading && <Loader2 size={16} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden="true" />}
          {isLoading ? 'Improving' : 'Improve section'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <ToolLayout
        title="Improve a section"
        description="Paste one section of your resume. Get a stronger rewrite, the reasons behind each change, and versions to choose from."
        featureType="improve"
        input={input}
        includes={INCLUDES}
        isLoading={isLoading}
        progress={<AnalysisProgress title="Rewriting your section" stages={SECTION_IMPROVEMENT_STAGES} />}
        error={error}
        onRetry={lastRun.current ? () => handleImprovement(...lastRun.current) : undefined}
        result={result && <SectionImprovementResults data={result} original={submittedText} />}
        onReset={() => { setResult(null); setError(null); }}
      >
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeData?.reason || 'LIMIT_REACHED'}
          featureType="improve"
          currentTier={upgradeData?.tier || 'free'}
          usageInfo={upgradeData}
        />
      </ToolLayout>
    </>
  );
}
