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
      {/* //I want to add some components here if it was login page  */}
      {/* Can you make it */}
      <main className="flex-1 px-4 2xl:container sm:px-10 xl:px-12 2xl:mx-auto main-slider">
        {children}
      </main>

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}