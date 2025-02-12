import { locales } from '~/i18n/routing';
import { Page as MakeswiftPage } from '~/lib/makeswift';

import { KlaviyoForm } from '~/belami/components/klaviyo/klaviyo-form';

interface Params {
  locale: string;
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<Params>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  return <>
    <MakeswiftPage locale={locale} path="/" />
    <KlaviyoForm /> 
  </>;
}