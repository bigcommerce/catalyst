import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';

import { getBlog, getBlogMetaData, getBlogPosts } from '../../page-data';

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{ tagId: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  return await getBlogMetaData();
}

async function listBlogPosts(props: Props) {
  const { tagId } = await props.params;
  const searchParams = await props.searchParams;
  const blogPosts = await getBlogPosts({ tagId, ...searchParams });
  const posts = blogPosts?.posts ?? [];

  return posts;
}

async function getPaginationInfo(props: Props) {
  const { tagId } = await props.params;
  const searchParams = await props.searchParams;
  const blogPosts = await getBlogPosts({ tagId, ...searchParams });

  return pageInfoTransformer(blogPosts?.pageInfo);
}

export default async function Tag(props: Props) {
  const { tagId } = await props.params;
  const blog = await getBlog();

  if (!blog) {
    return notFound();
  }

  return (
    <FeaturedBlogPostList
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
          label: tagId,
          href: '#',
        },
      ]}
      description={blog.description}
      paginationInfo={getPaginationInfo(props)}
      posts={listBlogPosts(props)}
      title={blog.name}
    />
  );
}
