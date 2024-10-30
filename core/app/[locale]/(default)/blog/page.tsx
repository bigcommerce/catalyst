import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { BlogPostCard } from '~/components/blog-post-card';
import { Pagination } from '~/components/ui/pagination';
import { LocaleType } from '~/i18n/routing';

import { getBlogPosts } from './page-data';

interface Props {
  params: { locale: LocaleType };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations('Blog');
  const blogPosts = await getBlogPosts(searchParams);

  return {
    title: blogPosts?.name ?? t('title'),
    description:
      blogPosts?.description && blogPosts.description.length > 150
        ? `${blogPosts.description.substring(0, 150)}...`
        : blogPosts?.description,
  };
}

export default async function Blog({ searchParams }: Props) {
  const blogPosts = await getBlogPosts(searchParams);

  if (!blogPosts) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-3xl font-black lg:text-5xl">{blogPosts.name}</h1>

      <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {blogPosts.posts.items.map((post) => {
          return (
            <li key={post.entityId}>
              <BlogPostCard data={post} />
            </li>
          );
        })}
      </ul>

      <Pagination
        endCursor={blogPosts.posts.pageInfo.endCursor ?? undefined}
        hasNextPage={blogPosts.posts.pageInfo.hasNextPage}
        hasPreviousPage={blogPosts.posts.pageInfo.hasPreviousPage}
        startCursor={blogPosts.posts.pageInfo.startCursor ?? undefined}
      />
    </div>
  );
}

export const runtime = 'edge';
