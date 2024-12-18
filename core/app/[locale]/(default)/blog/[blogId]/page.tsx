import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter } from 'next-intl/server';

import { BlogPostContent } from '@/vibes/soul/sections/blog-post-content';

import { getBlogPageData } from './page-data';

interface Props {
  params: Promise<{
    blogId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId } = await params;

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

export default async function Blog({ params }: Props) {
  const { blogId } = await params;

  const format = await getFormatter();

  const data = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = data?.content.blog?.post;

  if (!blogPost) {
    return notFound();
  }

  return (
    <BlogPostContent
      author={blogPost.author ?? undefined}
      breadcrumbs={[
        {
          label: 'Home',
          href: '/',
        },
        {
          label: 'Blog',
          href: '/blog',
        },
        {
          label: blogPost.name,
          href: '#',
        },
      ]}
      content={blogPost.htmlBody}
      date={format.dateTime(new Date(blogPost.publishedDate.utc))}
      image={
        blogPost.thumbnailImage
          ? { alt: blogPost.thumbnailImage.altText, src: blogPost.thumbnailImage.url }
          : undefined
      }
      tags={blogPost.tags.map((tag) => ({
        label: tag,
        link: {
          href: `/blog/tag/${tag}`,
        },
      }))}
      title={blogPost.name}
    />
  );
}
