import { Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPostCardBlogPost } from '@/vibes/soul/primitives/blog-post-card';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { BlogPostList } from '@/vibes/soul/sections/blog-post-list';

interface Props {
  title: string;
  description?: string;
  posts: Streamable<BlogPostCardBlogPost[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  emptyStateSubtitle?: Streamable<string | null>;
  emptyStateTitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function FeaturedBlogPostList({
  title,
  description,
  posts,
  paginationInfo,
  breadcrumbs,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount,
}: Props) {
  return (
    <section className="@container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

        <div className="pt-6">
          <h1 className="mb-3 font-heading text-4xl font-medium leading-none text-foreground @xl:text-5xl @4xl:text-6xl">
            {title}
          </h1>

          {description != null && description !== '' && (
            <p className="max-w-lg text-lg text-contrast-500">{description}</p>
          )}

          <BlogPostList
            className="mb-8 mt-8 @4xl:mb-10 @4xl:mt-10"
            emptyStateSubtitle={emptyStateSubtitle}
            emptyStateTitle={emptyStateTitle}
            placeholderCount={placeholderCount}
            posts={posts}
          />

          {paginationInfo && <CursorPagination info={paginationInfo} />}
        </div>
      </div>
    </section>
  );
}
