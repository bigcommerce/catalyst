import { clsx } from 'clsx';
import { getTranslations } from 'next-intl/server';

import '../globals.css';

import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { fonts } from '~/app/fonts';
import { defaultLocale } from '~/i18n/locales';

export default async function NotFound() {
  const t = await getTranslations({ namespace: 'NotFound', locale: defaultLocale });

  return (
    <html className={clsx(fonts.map((f) => f.variable))} lang={defaultLocale}>
      <body className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col place-content-center">
          <SectionLayout containerSize="2xl">
            <header className="font-[family-name:var(--not-found-font-family,var(--font-family-body))]">
              <h1 className="mb-3 font-[family-name:var(--not-found-title-font-family,var(--font-family-heading))] text-3xl font-medium leading-none text-[var(--not-found-title,hsl(var(--foreground)))] @xl:text-4xl @4xl:text-5xl">
                {t('title')}
              </h1>
              <p className="mb-4 text-lg text-[var(--not-found-subtitle,hsl(var(--contrast-500)))]">
                {t('subtitle')}
              </p>
            </header>
          </SectionLayout>
        </div>
      </body>
    </html>
  );
}
