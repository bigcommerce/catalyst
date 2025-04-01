import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  type BlogPost,
  BlogPostCard,
  BlogPostCardSkeleton,
} from '@/vibes/soul/primitives/blog-post-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

export interface BlogPostListProps {
  blogPosts: Streamable<BlogPost[]>;
  className?: string;
  emptyStateSubtitle?: Streamable<string>;
  emptyStateTitle?: Streamable<string>;
  placeholderCount?: number;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --blog-post-list-empty-state-title-font-family: var(--font-family-heading);
 *   --blog-post-list-empty-state-subtitle-font-family: var(--font-family-body);
 *   --blog-post-list-empty-state-title: hsl(var(--foreground));
 *   --blog-post-list-empty-state-subtitle: hsl(var(--contrast-500));
 * }
 * ```
 */
export function BlogPostList({
  blogPosts: streamableBlogPosts,
  className = '',
  emptyStateTitle = 'No blog posts found',
  emptyStateSubtitle = 'Check back later for more content.',
  placeholderCount = 6,
}: BlogPostListProps) {
  return (
    <Stream
      fallback={<BlogPostListSkeleton className={className} placeholderCount={placeholderCount} />}
      value={streamableBlogPosts}
    >
      {(blogPosts) => {
        if (blogPosts.length === 0) {
          return (
            <BlogPostListEmptyState
              className={className}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className={clsx('@container', className)}>
            <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3">
              {blogPosts.map(({ ...post }) => (
                <BlogPostCard key={post.href} {...post} />
              ))}
            </div>
          </div>
        );
      }}
    </Stream>
  );
}

export function BlogPostListSkeleton({
  className,
  placeholderCount = 6,
}: Pick<BlogPostListProps, 'className' | 'placeholderCount'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-[[data-pending]]/blog-post-list:animate-pulse', className)}
      pending
    >
      <div className="mx-auto grid grid-cols-1 gap-x-5 gap-y-8 @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

export function BlogPostListEmptyState({
  className,
  placeholderCount = 6,
  emptyStateTitle,
  emptyStateSubtitle,
}: Omit<BlogPostListProps, 'blogPosts'>) {
  return (
    <div className={clsx('relative w-full @container', className)}>
      <div
        className={clsx(
          'mx-auto grid grid-cols-1 gap-x-5 gap-y-8 [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @md:grid-cols-2 @xl:gap-y-10 @3xl:grid-cols-3',
        )}
      >
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
      <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
        <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
          <h3 className="font-[family-name:var(--blog-post-list-empty-state-title-font-family,var(--font-family-heading))] text-2xl leading-tight text-[var(--blog-post-list-empty-state-title,hsl(var(--foreground)))] @4xl:text-4xl @4xl:leading-none">
            {emptyStateTitle}
          </h3>
          <p className="font-[family-name:var(--blog-post-list-empty-state-subtitle-font-family,var(--font-family-body))] text-sm text-[var(--blog-post-list-empty-state-subtitle,hsl(var(--contrast-500)))] @4xl:text-lg">
            {emptyStateSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
