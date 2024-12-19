import { Page as MakeswiftPage } from '~/lib/makeswift';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  return <MakeswiftPage locale={locale} path="/" />;
}
