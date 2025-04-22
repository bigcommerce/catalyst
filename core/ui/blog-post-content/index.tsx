import { type Streamable } from '@/vibes/soul/lib/streamable';
import { type Breadcrumb } from '~/ui/breadcrumbs';

interface Tag {
  label: string;
  link: {
    href: string;
    target?: string;
  };
}

interface Image {
  src: string;
  alt: string;
}

export interface BlogPostContentBlogPost {
  title: string;
  author?: string;
  date: string;
  tags?: Tag[];
  content: string;
  image?: Image;
}

export interface BlogPostContentData {
  blogPost: Streamable<BlogPostContentBlogPost>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
}

export { BlogPostContent } from '@/vibes/soul/sections/blog-post-content';
