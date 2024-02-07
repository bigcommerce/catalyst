import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getReCaptchaSettings } from '~/client/queries/get-recaptcha-settings';
import { getWebPage } from '~/client/queries/get-web-page';
import { ContactUs } from '~/components/forms';

import { PageContent } from '../_components/page-content';

interface Props {
  params: { page: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/${params.page}`;
  const webpage = await getWebPage({ path });

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

export default async function WebPage({ params }: Props) {
  const path = `/${params.page}`;
  const webpage = await getWebPage({ path });

  if (!webpage) {
    notFound();
  }

  const { name, htmlBody, __typename: pageType, entityId } = webpage;

  switch (pageType) {
    case 'ContactPage': {
      const reCaptchaSettings = await getReCaptchaSettings();

      return (
        <>
          <PageContent content={htmlBody} title={name} />
          <ContactUs
            fields={webpage.contactFields}
            pageEntityId={entityId}
            reCaptchaSettings={reCaptchaSettings}
          />
        </>
      );
    }

    case 'NormalPage':
    default:
      return <PageContent content={htmlBody} title={name} />;
  }
}

export const runtime = 'edge';
