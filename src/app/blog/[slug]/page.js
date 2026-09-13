import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import PrimaryCta from '../../../components/PrimaryCta';
import { getAllArticleSlugs, getArticleBySlug, getArticleMetadata } from '../../../lib/blog';

export function generateStaticParams() {
  return getAllArticleSlugs();
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const meta = getArticleMetadata(slug);
  const article = meta && getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        <Link href="/blog" className="btn btn-ghost -ml-3 h-8 px-3 text-sm">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          All guides
        </Link>

        <article className="mt-6">
          <header className="max-w-[68ch] border-b border-line pb-8">
            <h1 className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-ink md:text-5xl md:leading-[52px]">
              {meta.title}
            </h1>
            <p className="mt-4 text-sm text-ink-3">
              <time dateTime={meta.date}>
                {new Date(meta.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span aria-hidden="true"> · </span>
              {meta.readTime}
              <span aria-hidden="true"> · </span>
              {meta.author}
            </p>
          </header>

          {/* Content is our own markdown from public/assets, rendered at build time. */}
          <div className="article mt-8" dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        <section className="mt-16 flex max-w-[68ch] flex-col gap-6 rounded-panel bg-accent-soft p-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl leading-7 font-semibold tracking-[-0.01em] text-ink">
            Check your own resume against a job post.
          </h2>
          <div className="shrink-0">
            <PrimaryCta />
          </div>
        </section>
      </div>
    </>
  );
}
