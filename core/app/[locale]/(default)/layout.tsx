import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { Cart } from '~/components/header/cart';
import { LocaleType } from '~/i18n/routing';
// import CustomerSupportDrawer from './sales-buddy/customerSupportDrawer';
import SalesBuddyPage from './sales-buddy/page';

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
      <main className="main-slider">
        {children}
      </main>
      <Suspense>
        <Footer />
        {/* <CustomerSupportDrawer /> */}
      </Suspense>
    </>
  );
}