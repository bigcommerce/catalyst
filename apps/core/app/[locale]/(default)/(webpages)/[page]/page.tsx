import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { getReCaptchaSettings } from '~/client/queries/get-recaptcha-settings';
import { getWebPage } from '~/client/queries/get-web-page';
import { ContactUs } from '~/components/forms';

import { PageContent } from '../_components/page-content';

interface Props {
  params: { page: string; locale: string };
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

export default async function WebPage({ params: { locale, page } }: Props) {
  const path = `/${page}`;
  const webpage = await getWebPage({ path });

  if (!webpage) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const { name, htmlBody, __typename: pageType, entityId } = webpage;

  switch (pageType) {
    case 'ContactPage': {
      const reCaptchaSettings = await getReCaptchaSettings();

      return (
        <>
          <PageContent content={htmlBody} title={name} />
          <NextIntlClientProvider locale={locale} messages={{ AboutUs: messages.AboutUs ?? {} }}>
            <ContactUs
              fields={webpage.contactFields}
              pageEntityId={entityId}
              reCaptchaSettings={reCaptchaSettings}
            />
          </NextIntlClientProvider>
        </>
      );
    }

    case 'NormalPage':
    default:
      return <PageContent content={htmlBody} title={name} />;
  }
}

export const runtime = 'edge';
