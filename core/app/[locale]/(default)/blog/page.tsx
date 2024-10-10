import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { FeaturedBlogPostList } from '@/vibes/soul/components/featured-blog-post-list';
import { LocaleType } from '~/i18n/routing';

import { BlogPostList } from './_components/blog-post-list';
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

export default function Blog({ searchParams }: Props) {
  return (
    <Suspense fallback={<FeaturedBlogPostList posts={[]} title="Blog" />}>
      <BlogPostList searchParams={searchParams} />
    </Suspense>
  );
}

export const runtime = 'edge';
