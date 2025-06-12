import { faker } from '@faker-js/faker';

import { Fixture } from '~/tests/fixtures/fixture';
import { Blog, BlogPost, CreateBlogPostData } from '~/tests/fixtures/utils/api/blog';

export class BlogFixture extends Fixture {
  posts: BlogPost[] = [];

  getBlog(): Promise<Blog> {
    return this.api.blog.get();
  }

  getPosts(page?: number, limit?: number): Promise<BlogPost[]> {
    return this.api.blog.getPosts(page, limit);
  }

  async createPost(data?: Partial<CreateBlogPostData>): Promise<BlogPost> {
    this.skipIfReadonly();

    const blogPost = await this.api.blog.createPost({
      title: `Test Post ${faker.string.alpha(5)}`,
      body: faker.lorem.paragraphs({ min: 1, max: 5 }),
      author: faker.person.fullName(),
      tags: [faker.lorem.word(), faker.lorem.word()],
      isPublished: true,
      ...data,
    });

    this.posts.push(blogPost);

    return blogPost;
  }

  async cleanup() {
    await this.api.blog.deletePosts(this.posts.map(({ id }) => id));
  }
}
