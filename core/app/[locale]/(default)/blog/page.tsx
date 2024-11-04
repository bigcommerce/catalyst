import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';
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

  const formattedBlogPosts = blogPosts.posts.items.map((post) => ({
    id: post.entityId.toString(),
    author: post.author,
    content: post.plainTextSummary,
    date: post.publishedDate.utc,
    image: { src: post.thumbnailImage?.url ?? '', alt: post.thumbnailImage?.altText ?? '' },
    href: `/blog/${post.entityId}`,
    title: post.name,
  }));

  return (
    <FeaturedBlogPostList
      // cta={{ href: '#', label: 'View All' }} // TODO: remove
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget risus in purus."
      posts={formattedBlogPosts}
      title="Blog"
    />
  );
}

export const runtime = 'edge';
