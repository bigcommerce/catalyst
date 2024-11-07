import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter } from 'next-intl/server';

import { BlogPostContent } from '@/vibes/soul/sections/blog-post-content';

import { getBlogPageData } from './page-data';

interface Props {
  params: {
    blogId: string;
  };
}

export async function generateMetadata({ params: { blogId } }: Props): Promise<Metadata> {
  const data = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = data?.content.blog?.post;

  if (!blogPost) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = blogPost.seo;

  return {
    title: pageTitle || blogPost.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Blog({ params: { blogId } }: Props) {
  const format = await getFormatter();

  const data = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = data?.content.blog?.post;

  if (!blogPost) {
    return notFound();
  }

  return (
    <BlogPostContent
      author={blogPost.author ?? ''}
      content={blogPost.htmlBody}
      date={format.dateTime(new Date(blogPost.publishedDate.utc))}
      image={
        blogPost.thumbnailImage
          ? { src: blogPost.thumbnailImage.url, alt: blogPost.thumbnailImage.altText }
          : null
      }
      // tags={blogPost.tags}
      title={blogPost.name}
    />
  );
}

export const runtime = 'edge';
