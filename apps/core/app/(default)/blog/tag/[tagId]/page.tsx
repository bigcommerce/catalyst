import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getBlogPosts } from '~/client/queries/getBlogPosts';
import { BlogPostCard } from '~/components/BlogPostCard';

interface Props {
  params: {
    tagId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BlogPostPage({ params: { tagId }, searchParams }: Props) {
  const blogPosts = await getBlogPosts({ tagId, ...searchParams });

  if (!blogPosts || !blogPosts.isVisibleInNavigation) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-h3 lg:text-h2">{blogPosts.name}</h1>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {blogPosts.posts.items.map((post) => {
          return <BlogPostCard blogPost={post} key={post.entityId} />;
        })}
      </div>

      <nav aria-label="Pagination" className="mb-12 mt-10 flex justify-center text-blue-primary">
        {blogPosts.posts.pageInfo.hasPreviousPage ? (
          <Link
            className="focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
            href={`/blog/tag/${tagId}?before=${String(blogPosts.posts.pageInfo.startCursor)}`}
            scroll={false}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8" />
          </Link>
        ) : (
          <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
        )}
        {blogPosts.posts.pageInfo.hasNextPage ? (
          <Link
            className="focus:outline-none focus:ring-4 focus:ring-blue-primary/20"
            href={`/blog/tag/${tagId}?after=${String(blogPosts.posts.pageInfo.endCursor)}`}
            scroll={false}
          >
            <span className="sr-only">Next</span>
            <ChevronRight aria-hidden="true" className="inline-block h-8 w-8" />
          </Link>
        ) : (
          <ChevronRight aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
        )}
      </nav>
    </div>
  );
}

export const runtime = 'edge';
