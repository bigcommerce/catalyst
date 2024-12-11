import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { ContactUs } from './contact-us';
import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getWebpageData({ id: decodeURIComponent(id) });
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

export default async function WebPage({ params }: Props) {
  const { id } = await params;

  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

  if (!webpage) {
    notFound();
  }

  const { name, htmlBody } = webpage;
  const recaptchaSettings = await bypassReCaptcha(data.site.settings?.reCaptcha);

  return (
    <>
      <div className="mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3">
        <h1 className="text-4xl font-black lg:text-5xl">{name}</h1>
        <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      </div>

      <ContactUs node={webpage} reCaptchaSettings={recaptchaSettings} />
    </>
  );
}

export const runtime = 'edge';
