import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { ContactUs } from './contact-us';
import { getWebpageData } from './page-data';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getWebpageData({ id: decodeURIComponent(params.id) });
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

  if (!webpage) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: metaKeywords,
  };
}

export default async function WebPage({ params: { id } }: Props) {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;
  const recaptchaSettings = data.site.settings?.reCaptcha;

  if (!webpage) {
    notFound();
  }

  const { name, htmlBody } = webpage;

  return (
    <>
      <div className="mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3">
        <h1 className="text-4xl font-black lg:text-5xl">{name}</h1>
        <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      </div>

      <ContactUs node={webpage} reCaptchaSettings={bypassReCaptcha(recaptchaSettings)} />
    </>
  );
}

export const runtime = 'edge';
