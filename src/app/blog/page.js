import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { AdWrapper, InFeedAd, FooterBannerAd } from '../../components/ads';
import { getAllArticles } from '../../lib/blog';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

function Meta({ article }) {
  return (
    <p className="text-sm text-ink-3">
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      <span aria-hidden="true"> · </span>
      {article.readTime}
    </p>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = getAllArticles();

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <header className="max-w-[60ch] border-b border-line pb-10">
          <h1 className="text-4xl leading-10 font-semibold tracking-[-0.03em] text-ink lg:text-5xl lg:leading-[52px]">
            Resume guides
          </h1>
          <p className="mt-4 text-lg leading-7 text-ink-2">
            Practical notes on keywords, formatting and applicant tracking systems.
          </p>
        </header>

        {featured && (
          <article className="grid gap-4 border-b border-line py-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Meta article={featured} />
              <h2 className="mt-2 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink md:text-4xl md:leading-[42px]">
                <Link href={`/blog/${featured.slug}`} className="hover:text-accent">
                  {featured.title}
                </Link>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-7">
              <p className="text-lg leading-7 text-ink-2">{featured.description}</p>
              <Link href={`/blog/${featured.slug}`} className="btn btn-secondary mt-5">
                Read article
              </Link>
            </div>
          </article>
        )}

        <AdWrapper className="py-6">
          <InFeedAd />
        </AdWrapper>

        <ul className="grid gap-x-12 md:grid-cols-2">
          {rest.map((article) => (
            <li key={article.slug} className="border-b border-line py-8">
              <article>
                <Meta article={article} />
                <h2 className="mt-2 text-xl leading-7 font-semibold tracking-[-0.01em] text-ink">
                  <Link href={`/blog/${article.slug}`} className="hover:text-accent">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-ink-2">{article.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <AdWrapper>
        <FooterBannerAd />
      </AdWrapper>
    </>
  );
}
