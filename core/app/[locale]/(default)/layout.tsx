import { unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { Cart } from '~/components/header/cart';
import { LocaleType } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: { locale: LocaleType };
}

export default function DefaultLayout({ children, params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header cart={<Cart />} />
      </Suspense>

      <main>{children}</main>

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
