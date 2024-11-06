import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { LocaleType } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: { locale: LocaleType };
}

export default function DefaultLayout({ children, params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>

      <main>{children}</main>

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
