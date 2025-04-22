import { getTranslations } from 'next-intl/server';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { NotFound as NotFoundSection } from '~/ui/not-found';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <>
      <Header />

      <NotFoundSection
        className="flex-1 place-content-center"
        subtitle={t('subtitle')}
        title={t('title')}
      />

      <Footer />
    </>
  );
}
