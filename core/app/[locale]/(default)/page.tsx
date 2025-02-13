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
    <div className='[&_.css-99zmsg]:!list-outside [&_::marker]:!text-white'>
    <MakeswiftPage locale={locale} path="/" />
    </div>
    <KlaviyoForm /> 
  </>;
}