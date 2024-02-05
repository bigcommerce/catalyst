import {
  BlogPostAuthor,
  BlogPostBanner,
  BlogPostDate,
  BlogPostImage,
  BlogPostTitle,
} from '@bigcommerce/reactant/BlogPostCard';
import { Tag, TagContent } from '@bigcommerce/reactant/Tag';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getBlogPost } from '~/client/queries/getBlogPost';
import { Link } from '~/components/Link';
import { SharingLinks } from '~/components/SharingLinks';

interface Props {
  params: {
    blogId: string;
  };
}

export async function generateMetadata({ params: { blogId } }: Props): Promise<Metadata> {
  const blogPost = await getBlogPost(+blogId);

  const title = blogPost?.seo.pageTitle ?? 'Blog';

  return {
    title,
  };
}

export default async function BlogPostPage({ params: { blogId } }: Props) {
  const blogPost = await getBlogPost(+blogId);

  if (!blogPost || !blogPost.isVisibleInNavigation) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-h3 lg:text-h2">{blogPost.name}</h1>

      <div className="mb-8 flex">
        <BlogPostDate className="mb-0">
          {new Intl.DateTimeFormat('en-US').format(new Date(blogPost.publishedDate.utc))}
        </BlogPostDate>
        {blogPost.author ? <BlogPostAuthor>, by {blogPost.author}</BlogPostAuthor> : null}
      </div>

      {blogPost.thumbnailImage ? (
        <BlogPostImage className="mb-6 h-40 sm:h-80 lg:h-96">
          <Image
            alt={blogPost.thumbnailImage.altText}
            className="h-full w-full object-cover object-center"
            height={900}
            src={blogPost.thumbnailImage.url}
            width={900}
          />
        </BlogPostImage>
      ) : (
        <BlogPostBanner className="mb-6 h-40 sm:h-80 lg:h-96">
          <BlogPostTitle className="text-h4" variant="inBanner">
            <span className="text-blue-primary">{blogPost.name}</span>
          </BlogPostTitle>
          <BlogPostDate className="text-h5" variant="inBanner">
            <span className="text-blue-primary">
              {new Intl.DateTimeFormat('en-US').format(new Date(blogPost.publishedDate.utc))}
            </span>
          </BlogPostDate>
        </BlogPostBanner>
      )}

      <div className="mb-10 text-base" dangerouslySetInnerHTML={{ __html: blogPost.htmlBody }} />
      <div className="mb-10 flex">
        {blogPost.tags.map((tag) => (
          <Link className="me-3 block cursor-pointer" href={`/blog/tag/${tag}`} key={tag}>
            <Tag>
              <TagContent>{tag}</TagContent>
            </Tag>
          </Link>
        ))}
      </div>
      <SharingLinks
        blogPostId={blogId}
        blogPostImageUrl={blogPost.thumbnailImage?.url}
        blogPostTitle={blogPost.seo.pageTitle}
        vanityUrl={blogPost.vanityUrl}
      />
    </div>
  );
}

export const runtime = 'edge';
