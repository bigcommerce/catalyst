import { type Streamable } from '@/vibes/soul/lib/streamable';
import { type BlogPostCardBlogPost } from '~/ui/blog-post-list';
import { type Breadcrumb } from '~/ui/breadcrumbs';

// @todo common-interface.ts?
interface CursorPaginationInfo {
  startCursorParamName?: string;
  startCursor?: string | null;
  endCursorParamName?: string;
  endCursor?: string | null;
}

export interface FeaturedBlogPostListData {
  posts: Streamable<BlogPostCardBlogPost[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
}

export { FeaturedBlogPostList } from '@/vibes/soul/sections/featured-blog-post-list';
