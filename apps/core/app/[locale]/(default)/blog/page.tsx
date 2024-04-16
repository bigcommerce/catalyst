import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { BlogPostCard } from '~/components/blog-post-card';
import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';

import { getBlogPosts } from './page-data';

interface Props {
  params: { locale: LocaleType };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const blogPosts = await getBlogPosts(searchParams);

  const title = blogPosts?.name ?? 'Blog';

  return {
    title,
  };
}

export default async function BlogPostPage({ params: { locale }, searchParams }: Props) {
  const blogPosts = await getBlogPosts(searchParams);
  const t = await getTranslations({ locale, namespace: 'Pagination' });

  if (!blogPosts || !blogPosts.isVisibleInNavigation) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-3xl font-black lg:text-5xl">{blogPosts.name}</h1>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {blogPosts.posts.items.map((post) => {
          return <BlogPostCard data={post} key={post.entityId} />;
        })}
      </div>

      <nav aria-label="Pagination" className="mb-12 mt-10 flex justify-center text-primary">
        {blogPosts.posts.pageInfo.hasPreviousPage ? (
          <Link
            className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            href={`/blog?before=${String(blogPosts.posts.pageInfo.startCursor)}`}
            scroll={false}
          >
            <span className="sr-only">{t('prev')}</span>
            <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8" />
          </Link>
        ) : (
          <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
        )}
        {blogPosts.posts.pageInfo.hasNextPage ? (
          <Link
            className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            href={`/blog?after=${String(blogPosts.posts.pageInfo.endCursor)}`}
            scroll={false}
          >
            <span className="sr-only">{t('next')}</span>
            <ChevronRight aria-hidden="true" className="inline-block h-8 w-8" />
          </Link>
        ) : (
          <ChevronRight aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
        )}
      </nav>
    </div>
  );
}

export const runtime = 'edge';
