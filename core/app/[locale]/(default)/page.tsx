import { locales } from '~/i18n/routing';
import { Page as MakeswiftPage } from '~/lib/makeswift';

const klaviyoPublicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY;

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
    {/* Klaviyo Embed Form */}
    {/* <div className="klaviyo-form-VXCJF7" /> */}
    <div className={`klaviyo-form-${klaviyoPublicKey}`} /> 
  </>;
}