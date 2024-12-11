import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'NormalPage' ? data.node : null;

  if (!webpage) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

  return {
    title: pageTitle || webpage.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function WebPage({ params }: Props) {
  const { id } = await params;

  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'NormalPage' ? data.node : null;

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
