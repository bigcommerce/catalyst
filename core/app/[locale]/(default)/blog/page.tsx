import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { getBlog, getBlogPosts } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultPostLimit = 9;

const searchParamsCache = createSearchParamsCache({
  tag: parseAsString,
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultPostLimit),
});

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
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const blogPosts = await getBlogPosts(searchParamsParsed);
  const posts = blogPosts?.posts ?? [];

  return posts;
}

async function getEmptyStateTitle(): Promise<string | null> {
  const t = await getTranslations('Blog.Empty');

  return t('title');
}

async function getEmptyStateSubtitle(): Promise<string | null> {
  const t = await getTranslations('Blog.Empty');

  return t('subtitle');
}

async function getPaginationInfo(searchParamsPromise: Promise<SearchParams>) {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const blogPosts = await getBlogPosts(searchParamsParsed);

  return pageInfoTransformer(blogPosts?.pageInfo ?? defaultPageInfo);
}

export default async function Blog(props: Props) {
  const searchParamsParsed = searchParamsCache.parse(await props.searchParams);
  const { tag } = searchParamsParsed;
  const blog = await getBlog();

  if (!blog) {
    return notFound();
  }

  const tagCrumb = tag ? [{ label: tag, href: '#', id: tag }] : [];

  return (
    <FeaturedBlogPostList
      breadcrumbs={[
        {
          id: 'home',
          label: 'Home',
          href: '/',
        },
        {
          id: blog.path,
          label: blog.name,
          href: tag ? blog.path : '#',
        },
        ...tagCrumb,
      ]}
      description={blog.description}
      emptyStateSubtitle={getEmptyStateSubtitle()}
      emptyStateTitle={getEmptyStateTitle()}
      paginationInfo={getPaginationInfo(props.searchParams)}
      placeholderCount={6}
      posts={listBlogPosts(props.searchParams)}
      title={blog.name}
    />
  );
}
