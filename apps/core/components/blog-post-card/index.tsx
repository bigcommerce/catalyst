import {
  BlogPostAuthor,
  BlogPostBanner,
  BlogPostContent,
  BlogPostDate,
  BlogPostImage,
  BlogPostTitle,
  BlogPostCard as ComponentsBlogPostCard,
} from '@bigcommerce/components/blog-post-card';

import { FragmentOf, graphql } from '~/client/graphql';
import { Link } from '~/components/link';

import { BcImage } from '../bc-image';

export const BlogPostCardFragment = graphql(`
  fragment BlogPostCardFragment on BlogPost {
    author
    entityId
    name
    plainTextSummary
    publishedDate {
      utc
    }
    thumbnailImage {
      url: urlTemplate
      altText
    }
  }
`);

interface Props {
  data: FragmentOf<typeof BlogPostCardFragment>;
}

export const BlogPostCard = ({ data }: Props) => (
  <ComponentsBlogPostCard>
    {data.thumbnailImage ? (
      <BlogPostImage>
        <Link className="block w-full" href={`/blog/${data.entityId}`}>
          <BcImage
            alt={data.thumbnailImage.altText}
            className="h-full w-full object-cover object-center"
            height={300}
            src={data.thumbnailImage.url}
            width={300}
          />
        </Link>
      </BlogPostImage>
    ) : (
      <BlogPostBanner>
        <BlogPostTitle variant="inBanner">
          <span className="line-clamp-3 text-primary">{data.name}</span>
        </BlogPostTitle>
        <BlogPostDate variant="inBanner">
          <span className="text-primary">
            {new Intl.DateTimeFormat('en-US').format(new Date(data.publishedDate.utc))}
          </span>
        </BlogPostDate>
      </BlogPostBanner>
    )}

    <BlogPostTitle>
      <Link href={`/blog/${data.entityId}`}>{data.name}</Link>
    </BlogPostTitle>
    <BlogPostContent>{data.plainTextSummary}</BlogPostContent>
    <BlogPostDate>
      {new Intl.DateTimeFormat('en-US').format(new Date(data.publishedDate.utc))}
    </BlogPostDate>
    {data.author ? <BlogPostAuthor>, by {data.author}</BlogPostAuthor> : null}
  </ComponentsBlogPostCard>
);
