import {
  BlogPostAuthor,
  BlogPostBanner,
  BlogPostCard,
  BlogPostContent,
  BlogPostDate,
  BlogPostImage,
  BlogPostTitle,
} from '@bigcommerce/components/BlogPostCard';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BlogPostCard> = {
  component: BlogPostCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BlogPostCard>;

export const BlogPostCardWithImage: Story = {
  render: () => (
    <div className="mx-auto max-w-sm">
      <BlogPostCard asChild>
        <div>
          <BlogPostImage>
            <a
              className="focus:ring-blue-primary/20 block w-full focus:outline-none focus:ring-4"
              href="/"
            >
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-h4">
                Image
              </div>
            </a>
          </BlogPostImage>
          <BlogPostTitle>
            <a className="focus:ring-blue-primary/20 focus:outline-none focus:ring-4" href="/">
              Blog Post Title
            </a>
          </BlogPostTitle>
          <BlogPostContent>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </BlogPostContent>
          <BlogPostDate>8/15/23</BlogPostDate>
          <BlogPostAuthor>, by Author Name</BlogPostAuthor>
        </div>
      </BlogPostCard>
    </div>
  ),
};

export const BlogPostCardWithoutImage: Story = {
  render: () => (
    <div className="mx-auto max-w-sm">
      <BlogPostCard asChild>
        <div>
          <BlogPostBanner>
            <BlogPostTitle role="presentation" variant="inBanner">
              <span className="text-blue-primary">Blog Post Title</span>
            </BlogPostTitle>
            <BlogPostDate variant="inBanner">
              <span className="text-blue-primary">8/15/23</span>
            </BlogPostDate>
          </BlogPostBanner>
          <BlogPostTitle>
            <a className="focus:ring-blue-primary/20 focus:outline-none focus:ring-4" href="/">
              Blog Post Title
            </a>
          </BlogPostTitle>
          <BlogPostContent>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </BlogPostContent>
          <BlogPostDate>8/15/23</BlogPostDate>
          <BlogPostAuthor>, by Author Name</BlogPostAuthor>
        </div>
      </BlogPostCard>
    </div>
  ),
};
