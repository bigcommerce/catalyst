import { getTranslations, setRequestLocale } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { Link } from '~/components/link';
import { StoreLogo } from '~/components/store-logo';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { locales, LocaleType } from '~/i18n/routing';

import { LocaleLink } from './_components/locale-link';

const StoreSelectorPageQuery = graphql(
  `
    query StoreSelectorPageQuery {
      site {
        settings {
          ...StoreLogoFragment
        }
      }
    }
  `,
  [StoreLogoFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('StoreSelector');

  return {
    title: t('title'),
  };
}

interface Props {
  params: Promise<{ locale: LocaleType }>;
}

export default async function StoreSelector({ params }: Props) {
  const { locale: selectedLocale } = await params;

  setRequestLocale(selectedLocale);

  const t = await getTranslations('StoreSelector');

  const { data } = await client.fetch({
    document: StoreSelectorPageQuery,
  });

  const storeSettings = data.site.settings;

  return (
    <>
      <header className="flex h-[92px] items-center bg-white px-4 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
        {storeSettings && (
          <Link className="p-0" href="/">
            <StoreLogo data={storeSettings} />
          </Link>
        )}
      </header>
      <div className="flex flex-col gap-2 px-4 lg:container sm:px-10 lg:mx-auto lg:max-w-[1000px] lg:px-12">
        <h1 className="text-3xl font-black lg:text-4xl">{t('heading')}</h1>

        <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-3 md:gap-11 lg:grid-cols-4 lg:gap-8">
          {locales.map((locale) => (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            <LocaleLink key={locale} locale={locale} selected={selectedLocale === locale} />
          ))}
        </div>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
