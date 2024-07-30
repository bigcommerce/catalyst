import { getFormatter, getLocale } from 'next-intl/server';

import { FragmentOf, graphql } from '~/client/graphql';
import { BlogPostCard as ComponentsBlogPostCard } from '~/components/ui/blog-post-card';

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

export const BlogPostCard = async ({ data }: Props) => {
  const locale = await getLocale();
  const format = await getFormatter({ locale });

  return (
    <ComponentsBlogPostCard
      author={data.author}
      content={data.plainTextSummary}
      date={format.dateTime(new Date(data.publishedDate.utc))}
      link={{ href: `/blog/${data.entityId}` }}
      thumbnail={data.thumbnailImage}
      title={data.name}
    />
  );
};
