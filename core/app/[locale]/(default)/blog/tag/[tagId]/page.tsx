import { notFound } from 'next/navigation';

import { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';

import { getBlogPosts } from '../../page-data';

interface Props {
  params: Promise<{
    tagId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Tag(props: Props) {
  const searchParams = await props.searchParams;
  const { tagId } = await props.params;

  const blogPosts = await getBlogPosts({ tagId, ...searchParams });

  if (!blogPosts) {
    return notFound();
  }

  const formattedBlogPosts = blogPosts.posts.items.map((post) => ({
    id: post.entityId.toString(),
    author: post.author,
    content: post.plainTextSummary,
    date: post.publishedDate.utc,
    image: { src: post.thumbnailImage?.url ?? '', alt: post.thumbnailImage?.altText ?? '' },
    href: `/blog/${post.entityId}`,
    title: post.name,
  }));

  return (
    <FeaturedBlogPostList
      // cta={{ href: '#', label: 'View All' }} // TODO: remove
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget risus in purus."
      posts={formattedBlogPosts}
      title="Blog"
    />
  );
}

export const runtime = 'edge';
