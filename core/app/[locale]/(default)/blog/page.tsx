import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';

import { getBlog, getBlogMetaData, getBlogPosts } from './page-data';

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  return await getBlogMetaData();
}

async function listBlogPosts(searchParamsPromise: Promise<SearchParams>) {
  const searchParams = await searchParamsPromise;
  const blogPosts = await getBlogPosts(searchParams);
  const posts = blogPosts?.posts ?? [];

  return posts;
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
