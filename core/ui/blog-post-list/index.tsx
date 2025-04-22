import { type Streamable } from '@/vibes/soul/lib/streamable';

export interface BlogPostCardBlogPost {
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

export { BlogPostList } from '@/vibes/soul/sections/blog-post-list';
