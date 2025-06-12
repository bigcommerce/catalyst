export interface Blog {
  readonly name: string;
  readonly path: string;
}

export interface BlogPost {
  readonly id: number;
  readonly author?: string;
  readonly title: string;
  readonly body: string;
  readonly summary: string;
  readonly tags: string[];
  readonly path: string;
}

export interface CreateBlogPostData {
  title: string;
  body: string;
  author?: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface BlogApi {
  get: () => Promise<Blog>;
  getPosts: (page?: number, limit?: number) => Promise<BlogPost[]>;
  createPost: (data: CreateBlogPostData) => Promise<BlogPost>;
  deletePosts: (ids: number[]) => Promise<void>;
}

export { blogHttpClient } from './http';
