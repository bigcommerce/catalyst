import {
  BlogPostAuthor,
  BlogPostBanner,
  BlogPostContent,
  BlogPostDate,
  BlogPostImage,
  BlogPostTitle,
  BlogPostCard as ComponentsBlogPostCard,
} from '@bigcommerce/components/BlogPostCard';
import Image from 'next/image';

import { getBlogPosts } from '~/client/queries/get-blog-posts';
import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';

interface BlogPostCardProps {
  blogPost: ExistingResultType<typeof getBlogPosts>['posts']['items'][number];
}

export const BlogPostCard = ({ blogPost }: BlogPostCardProps) => (
  <ComponentsBlogPostCard>
    {blogPost.thumbnailImage ? (
      <BlogPostImage>
        <Link className="block w-full" href={`/blog/${blogPost.entityId}`}>
          <Image
            alt={blogPost.thumbnailImage.altText}
            className="h-full w-full object-cover object-center"
            height={300}
            src={blogPost.thumbnailImage.url}
            width={300}
          />
        </Link>
      </BlogPostImage>
    ) : (
      <BlogPostBanner>
        <BlogPostTitle variant="inBanner">
          <span className="line-clamp-3 text-blue-primary">{blogPost.name}</span>
        </BlogPostTitle>
        <BlogPostDate variant="inBanner">
          <span className="text-blue-primary">
            {new Intl.DateTimeFormat('en-US').format(new Date(blogPost.publishedDate.utc))}
          </span>
        </BlogPostDate>
      </BlogPostBanner>
    )}

    <BlogPostTitle>
      <Link href={`/blog/${blogPost.entityId}`}>{blogPost.name}</Link>
    </BlogPostTitle>
    <BlogPostContent>{blogPost.plainTextSummary}</BlogPostContent>
    <BlogPostDate>
      {new Intl.DateTimeFormat('en-US').format(new Date(blogPost.publishedDate.utc))}
    </BlogPostDate>
    {blogPost.author ? <BlogPostAuthor>, by {blogPost.author}</BlogPostAuthor> : null}
  </ComponentsBlogPostCard>
);
