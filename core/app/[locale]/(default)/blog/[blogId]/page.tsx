import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter } from 'next-intl/server';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Tag } from '~/components/ui/tag';

import { SharingLinks } from './_components/sharing-links';
import { getBlogPageData } from './page-data';

interface Props {
  params: {
    blogId: string;
  };
}

export async function generateMetadata({ params: { blogId } }: Props): Promise<Metadata> {
  const data = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = data?.content.blog?.post;

  if (!blogPost) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = blogPost.seo;

  return {
    title: pageTitle || blogPost.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Blog({ params: { blogId } }: Props) {
  const format = await getFormatter();

  const data = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = data?.content.blog?.post;

  if (!blogPost) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-black lg:text-5xl">{blogPost.name}</h1>

      <div className="mb-8 flex">
        <small className="mb-0 text-base text-gray-500">
          {format.dateTime(new Date(blogPost.publishedDate.utc))}
        </small>

        {Boolean(blogPost.author) && (
          <small className="text-base text-gray-500">, by {blogPost.author}</small>
        )}
      </div>

      {blogPost.thumbnailImage ? (
        <div className="mb-6 flex h-40 sm:h-80 lg:h-96">
          <BcImage
            alt={blogPost.thumbnailImage.altText}
            className="h-full w-full object-cover object-center"
            height={900}
            src={blogPost.thumbnailImage.url}
            width={900}
          />
        </div>
      ) : (
        <div className="mb-6 flex h-40 justify-between bg-primary/10 p-4 sm:h-80 lg:h-96">
          <h3 className="mb-0 flex-none basis-1/2 self-start text-3xl font-bold text-primary">
            {blogPost.name}
          </h3>
          <small className="mb-0 flex-none self-end text-xl font-bold text-primary">
            {format.dateTime(new Date(blogPost.publishedDate.utc))}
          </small>
        </div>
      )}

      <div className="mb-10 text-base" dangerouslySetInnerHTML={{ __html: blogPost.htmlBody }} />
      <div className="mb-10 flex">
        {blogPost.tags.map((tag) => (
          <Link className="me-3 block cursor-pointer" href={`/blog/tag/${tag}`} key={tag}>
            <Tag content={tag} />
          </Link>
        ))}
      </div>
      <SharingLinks data={data} />
    </div>
  );
}

export const runtime = 'edge';
