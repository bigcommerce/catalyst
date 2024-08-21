import { getFormatter, getLocale } from 'next-intl/server';

import { FragmentOf } from '~/client/graphql';
import { BlogPostCard as ComponentsBlogPostCard } from '~/components/ui/blog-post-card';

import { BlogPostCardFragment } from './fragment';

interface Props {
  data: FragmentOf<typeof BlogPostCardFragment>;
}

export const BlogPostCard = async ({ data }: Props) => {
  const locale = await getLocale();
  const format = await getFormatter({ locale });

  return (
    <ComponentsBlogPostCard
      author={data.author ?? undefined}
      content={data.plainTextSummary}
      date={format.dateTime(new Date(data.publishedDate.utc))}
      href={`/blog/${data.entityId}`}
      image={
        data.thumbnailImage
          ? { altText: data.thumbnailImage.altText, src: data.thumbnailImage.url }
          : undefined
      }
      title={data.name}
    />
  );
};
