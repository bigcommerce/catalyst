import { type Streamable } from '@/vibes/soul/lib/streamable';

interface Breadcrumb {
  label: string;
  href: string;
}

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

interface BlogPostContentBlogPost {
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
