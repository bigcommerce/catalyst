import { notFound } from 'next/navigation';

import { BlogPostCard } from '~/components/blog-post-card';
import { Pagination } from '~/components/ui/pagination';

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

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-3xl font-black lg:text-5xl">{blogPosts.name}</h1>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {blogPosts.posts.items.map((post) => {
          return <BlogPostCard data={post} key={post.entityId} />;
        })}
      </div>

      <Pagination
        endCursor={blogPosts.posts.pageInfo.endCursor ?? undefined}
        hasNextPage={blogPosts.posts.pageInfo.hasNextPage}
        hasPreviousPage={blogPosts.posts.pageInfo.hasPreviousPage}
        startCursor={blogPosts.posts.pageInfo.startCursor ?? undefined}
      />
    </div>
  );
}

export const runtime = 'edge';
