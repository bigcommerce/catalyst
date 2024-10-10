import { Suspense } from 'react';

import { FeaturedBlogPostList } from '@/vibes/soul/components/featured-blog-post-list';

import { BlogPostList } from '../../_components/blog-post-list';

interface Props {
  params: {
    tagId: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function Tag({ params: { tagId }, searchParams }: Props) {
  return (
    <Suspense fallback={<FeaturedBlogPostList posts={[]} title="Blog" />}>
      <BlogPostList searchParams={searchParams} tagId={tagId} />
    </Suspense>
  );
}

export const runtime = 'edge';
