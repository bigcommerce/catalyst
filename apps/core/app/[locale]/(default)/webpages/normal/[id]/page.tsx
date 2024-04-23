import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

interface Props {
  params: { id: string };
}

const NormalPageQuery = graphql(`
  query NormalPage($id: ID!) {
    node(id: $id) {
      ... on NormalPage {
        __typename
        name
        htmlBody
        entityId
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

const getWebpageData = cache(async (variables: { id: string }) => {
  const { data } = await client.fetch({
    document: NormalPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  if (data.node?.__typename !== 'NormalPage') {
    return null;
  }

  return data.node;
});

export async function generateMetadata({ params: { id } }: Props): Promise<Metadata> {
  const webpage = await getWebpageData({ id });

  if (!webpage) {
    notFound();
  }

  const { seo } = webpage;

  return {
    title: seo.pageTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
  };
}

export default async function WebPage({ params: { id } }: Props) {
  const webpage = await getWebpageData({ id });

  if (!webpage) {
    notFound();
  }

  const { name, htmlBody } = webpage;

  return (
    <div className="mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3">
      <h1 className="text-4xl font-black lg:text-5xl">{name}</h1>
      <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </div>
  );
}

export const runtime = 'edge';
