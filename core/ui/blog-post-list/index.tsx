import { type Streamable } from '@/vibes/soul/lib/streamable';

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

export interface BlogPostListData {
  posts: Streamable<BlogPostCardBlogPost[]>;
}
