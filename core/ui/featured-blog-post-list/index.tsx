import { type Streamable } from '@/vibes/soul/lib/streamable';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BlogPostCardBlogPost {
  id: string;
  author?: string | null;
  content: string;
  date: string;
  image?: {
    src: string;
    alt: string;
  };
  href: string;
  title: string;
}

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
