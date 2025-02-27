import { locales } from '~/i18n/routing';
import { Page as MakeswiftPage } from '~/lib/makeswift';

interface Params {
  locale: string;
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export default function Home() {
  return <MakeswiftPage locale="en" path="/" />;
}
