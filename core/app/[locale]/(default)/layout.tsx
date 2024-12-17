import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
      <>
        <Header />

        <main>{children}</main>

        <Footer />
      </>
    </MakeswiftProvider>
  );
}

export const experimental_ppr = true;
