import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { BlogPostContent, BlogPostContentBlogPost } from '@/vibes/soul/sections/blog-post-content';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getBlogPageData } from './page-data';

const cachedBlogPageDataVariables = cache((blogId: string) => ({ entityId: Number(blogId) }));

interface Props {
  params: Promise<{
    locale: string;
    blogId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId, locale } = await params;

  const variables = cachedBlogPageDataVariables(blogId);

  const blog = await getBlogPageData(variables);
  const blogPost = blog?.post;

  if (!blogPost) {
    return {};
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: blogPost.path, locale });
  const { pageTitle, metaDescription, metaKeywords } = blogPost.seo;

  return {
    title: makeswiftMetadata?.title || pageTitle || blogPost.name,
    ...((makeswiftMetadata?.description || metaDescription) && {
      description: makeswiftMetadata?.description || metaDescription,
    }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(blogPost.path && {
      alternates: await getMetadataAlternates({ path: blogPost.path, locale }),
    }),
  };
}

async function getBlogPost(props: Props): Promise<BlogPostContentBlogPost> {
  const format = await getFormatter();

  const { blogId } = await props.params;

  const variables = cachedBlogPageDataVariables(blogId);

  const blog = await getBlogPageData(variables);
  const blogPost = blog?.post;

  if (!blog || !blogPost) {
    return notFound();
  }

  return {
    author: blogPost.author ?? undefined,
    title: blogPost.name,
    content: blogPost.htmlBody,
    date: format.dateTime(new Date(blogPost.publishedDate.utc)),
    image: blogPost.thumbnailImage
      ? { alt: blogPost.thumbnailImage.altText, src: blogPost.thumbnailImage.url }
      : undefined,
    tags: blogPost.tags.map((tag) => ({
      label: tag,
      link: {
        href: `${blog.path}?tag=${tag}`,
      },
    })),
  };
}

async function getBlogPostBreadcrumbs(props: Props): Promise<Breadcrumb[]> {
  const t = await getTranslations('Blog');

  const { blogId } = await props.params;

  const variables = cachedBlogPageDataVariables(blogId);

  const blog = await getBlogPageData(variables);
  const blogPost = blog?.post;

  if (!blog || !blogPost) {
    return notFound();
  }

  return [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: blog.name,
      href: blog.path,
    },
    {
      label: blogPost.name,
      href: '#',
    },
  ];
}

export default async function Blog(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  return (
    <BlogPostContent blogPost={getBlogPost(props)} breadcrumbs={getBlogPostBreadcrumbs(props)} />
  );
}
