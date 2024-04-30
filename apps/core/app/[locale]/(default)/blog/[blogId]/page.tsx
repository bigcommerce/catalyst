import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter } from 'next-intl/server';

import { getBlogPost } from '~/client/queries/get-blog-post';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { SharingLinks } from '~/components/sharing-links';
import {
  BlogPostAuthor,
  BlogPostBanner,
  BlogPostDate,
  BlogPostImage,
  BlogPostTitle,
} from '~/components/ui/blog-post-card';
import { Tag, TagContent } from '~/components/ui/tag';
import { LocaleType } from '~/i18n';

interface Props {
  params: {
    blogId: string;
    locale?: LocaleType;
  };
}

export async function generateMetadata({ params: { blogId } }: Props): Promise<Metadata> {
  const blogPost = await getBlogPost(+blogId);

  const title = blogPost?.seo.pageTitle ?? 'Blog';

  return {
    title,
  };
}

export default async function BlogPostPage({ params: { blogId, locale } }: Props) {
  const format = await getFormatter({ locale });
  const blogPost = await getBlogPost(+blogId);

  if (!blogPost || !blogPost.isVisibleInNavigation) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-black lg:text-5xl">{blogPost.name}</h1>

      <div className="mb-8 flex">
        <BlogPostDate className="mb-0">
          {format.dateTime(new Date(blogPost.publishedDate.utc))}
        </BlogPostDate>
        {blogPost.author ? <BlogPostAuthor>, by {blogPost.author}</BlogPostAuthor> : null}
      </div>

      {blogPost.thumbnailImage ? (
        <BlogPostImage className="mb-6 h-40 sm:h-80 lg:h-96">
          <BcImage
            alt={blogPost.thumbnailImage.altText}
            className="h-full w-full object-cover object-center"
            height={900}
            src={blogPost.thumbnailImage.url}
            width={900}
          />
        </BlogPostImage>
      ) : (
        <BlogPostBanner className="mb-6 h-40 sm:h-80 lg:h-96">
          <BlogPostTitle variant="inBanner">
            <span className="text-primary">{blogPost.name}</span>
          </BlogPostTitle>
          <BlogPostDate variant="inBanner">
            <span className="text-primary">
              {format.dateTime(new Date(blogPost.publishedDate.utc))}
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
