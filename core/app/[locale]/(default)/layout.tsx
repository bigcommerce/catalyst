import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { Cart } from '~/components/header/cart';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header cart={<Cart />} />
      </Suspense>
      {/* //I want to add some components here if it was login page  */}
      {/* Can you make it */}
      <main className="flex-1 px-4 2xl:container sm:px-10 xl:px-12 2xl:mx-auto main-slider">
      {/* <main className="flex-1 main-slider"> */}
        {children}
      </main>

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}