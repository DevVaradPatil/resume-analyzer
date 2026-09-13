import Navbar from './Navbar';

/**
 * Frame for the privacy policy and terms (DESIGN.md section 10): article
 * typography, a sticky contents list on desktop, and a real last-updated
 * date. The wording inside is owner-controlled legal copy; restyle only.
 *
 * @param {Array<{id: string, title: string}>} sections - one per <section id>
 * @param {string} lastUpdated - ISO date of the last change to the wording
 */
export default function LegalPage({ title, lastUpdated, sections, children }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <header className="border-b border-line pb-8">
          <h1 className="text-4xl leading-10 font-semibold tracking-[-0.03em] text-ink lg:text-5xl lg:leading-[52px]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-3">
            Last updated{' '}
            <time dateTime={lastUpdated}>
              {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </p>
        </header>

        <div className="grid gap-12 pt-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Contents" className="hidden lg:block">
            <ul className="sticky top-24 mt-8 space-y-1 border-l border-line">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-ink-3 hover:border-line-strong hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="article">{children}</div>
        </div>
      </div>
    </>
  );
}
