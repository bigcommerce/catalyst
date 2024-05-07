import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { ContactUs } from './contact-us';
import { ContactUsFragment } from './contact-us/fragment';

interface Props {
  params: { id: string; locale: string };
}

const WebPageQuery = graphql(
  `
    query WebPage($id: ID!) {
      ...ContactUsFragment
      node(id: $id) {
        __typename
        ... on ContactPage {
          name
          htmlBody
          seo {
            pageTitle
            metaKeywords
            metaDescription
          }
        }
      }
    }
  `,
  [ContactUsFragment],
);

const getWebpageData = cache(async (variables: { id: string }) => {
  const { data } = await client.fetch({
    document: WebPageQuery,
    variables,
    fetchOptions: { next: { revalidate } },
  });

  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getWebpageData({ id: decodeURIComponent(params.id) });
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

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

export default async function WebPage({ params: { locale, id } }: Props) {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

  if (!webpage) {
    notFound();
  }

  const messages = await getMessages({ locale });

  const { name, htmlBody } = webpage;

  return (
    <>
      <div className="mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3">
        <h1 className="text-4xl font-black lg:text-5xl">{name}</h1>
        <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      </div>

      <NextIntlClientProvider locale={locale} messages={{ AboutUs: messages.AboutUs ?? {} }}>
        <ContactUs data={data} />
      </NextIntlClientProvider>
    </>
  );
}

export const runtime = 'edge';
