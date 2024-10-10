import { notFound } from 'next/navigation';

import { FeaturedBlogPostList } from '@/vibes/soul/components/featured-blog-post-list';

import { getBlogPosts } from '../page-data';

export const BlogPostList = async ({
  searchParams,
  tagId,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  tagId?: string;
}) => {
  const blogPosts = await getBlogPosts(tagId ? { tagId, ...searchParams } : searchParams);

  if (!blogPosts) {
    return notFound();
  }

  return (
    <FeaturedBlogPostList
      cta={{ href: '#', label: 'View All' }} // TODO: remove
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget risus in purus."
      posts={blogPosts.posts.items.map((post) => ({
        id: post.entityId.toString(),
        author: post.author,
        content: post.plainTextSummary,
        date: post.publishedDate.utc,
        image: { src: post.thumbnailImage?.url ?? '', altText: post.thumbnailImage?.altText ?? '' },
        href: `/blog/${post.entityId}`,
        title: post.name,
      }))}
      title="Blog"
    />
  );
};
