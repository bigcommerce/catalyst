import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header } from '~/components/header';
import { Cart } from '~/components/header/cart';
import { Subscribe } from '~/components/vibes/subscribe';
import { LocaleType } from '~/i18n/routing';

interface Props extends PropsWithChildren {
  params: { locale: LocaleType };
}

export default function DefaultLayout({ children, params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = useTranslations('Home');

  return (
    <>
      <Suspense>
        <Header cart={<Cart />} />
      </Suspense>

      <main>{children}</main>

      <Subscribe
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
        title={t('Subscribe.title')}
      />

      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
