import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';

import { getBlog, getBlogPosts } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Blog');
  const blog = await getBlog();

  return {
    title: blog?.name ?? t('title'),
    description:
      blog?.description && blog.description.length > 150
        ? `${blog.description.substring(0, 150)}...`
        : blog?.description,
  };
}

async function listBlogPosts(searchParamsPromise: Promise<SearchParams>) {
  const searchParams = await searchParamsPromise;
  const blogPosts = await getBlogPosts(searchParams);
  const format = await getFormatter();
  const posts = blogPosts?.posts.items ?? [];

  return posts.map((post) => ({
    id: String(post.entityId),
    author: post.author,
    content: post.plainTextSummary,
    date: format.dateTime(new Date(post.publishedDate.utc)),
    image: post.thumbnailImage
      ? {
          src: post.thumbnailImage.url,
          alt: post.thumbnailImage.altText,
        }
      : undefined,
    href: `/blog/${post.entityId}`,
    title: post.name,
  }));
}

export default async function Blog(props: Props) {
  const blog = await getBlog();

  if (!blog) {
    return notFound();
  }

  return (
    <FeaturedBlogPostList
      cta={{ href: '#', label: 'View All' }}
      description={blog.description}
      posts={listBlogPosts(props.searchParams)}
      title={blog.name}
    />
  );
}
