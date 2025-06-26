import { z } from 'zod';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { Blog, BlogApi, BlogPost, CreateBlogPostData } from '.';

const BlogSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    url: z.string(),
  })
  .transform(
    (data): Blog => ({
      name: data.name,
      path: data.url,
    }),
  );

const BlogPostSchema = z
  .object({
    id: z.number(),
    author: z.string().nullable(),
    title: z.string(),
    body: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    url: z.string(),
  })
  .transform(
    ({ url, author, ...data }): BlogPost => ({
      ...data,
      author: author ?? undefined,
      path: url,
    }),
  );

const BlogPostCreateSchema = z.object({
  title: z.string(),
  body: z.string(),
  author: z.string().optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const transformCreateBlogPostData = (data: CreateBlogPostData) =>
  BlogPostCreateSchema.parse({
    title: data.title,
    body: data.body,
    author: data.author,
    is_published: data.isPublished,
    tags: data.tags,
  });

export const blogHttpClient: BlogApi = {
  get: async () => {
    const pages = await httpClient
      .get('/v3/content/pages?limit=250')
      .parse(
        apiResponseSchema(z.array(z.object({ id: z.number(), type: z.string() }).passthrough())),
      );

    const blogPage = pages.data.find((page) => page.type === 'blog');

    if (!blogPage) {
      throw new Error('Blog not found');
    }

    return BlogSchema.parse(blogPage);
  },
  getPosts: async (page = 1, limit = 9) => {
    const posts = await httpClient
      .get(`/v2/blog/posts?page=${page}&limit=${limit}&is_published=true`)
      .parse(z.array(BlogPostSchema).optional());

    return posts ?? [];
  },
  createPost: async (data) => {
    const post = await httpClient
      .post('/v2/blog/posts', transformCreateBlogPostData(data))
      .parse(BlogPostSchema);

    return post;
  },
  deletePosts: async (ids: number[]) => {
    if (ids.length > 0) {
      await Promise.all(ids.map((id) => httpClient.delete(`/v2/blog/posts/${id}`)));
    }
  },
};
