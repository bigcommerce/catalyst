import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPagination } from '@/vibes/soul/primitives/cursor-pagination';
import { BlogPostList } from '@/vibes/soul/sections/blog-post-list';
import { Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { type FeaturedBlogPostListData } from '~/ui/featured-blog-post-list';

interface Props extends FeaturedBlogPostListData {
  title: string;
  description?: string;
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
    <SectionLayout>
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <div className="pt-6">
        <h1 className="font-heading text-foreground mb-3 text-4xl leading-none font-medium @xl:text-5xl @4xl:text-6xl">
          {title}
        </h1>

        {description != null && description !== '' && (
          <p className="text-contrast-500 max-w-lg text-lg">{description}</p>
        )}

        <BlogPostList
          className="mt-8 mb-8 @4xl:mt-10 @4xl:mb-10"
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          placeholderCount={placeholderCount}
          posts={posts}
        />

        {paginationInfo && <CursorPagination info={paginationInfo} />}
      </div>
    </SectionLayout>
  );
}
