import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { getBlog, getBlogMetaData, getBlogPosts } from './page-data';

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
  return await getBlogMetaData();
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

  const tagCrumb = tag ? [{ label: tag, href: '#' }] : [];

  return (
    <FeaturedBlogPostList
      breadcrumbs={[
        {
          label: 'Home',
          href: '/',
        },
        {
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
