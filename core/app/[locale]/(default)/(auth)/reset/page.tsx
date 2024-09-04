import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { locales, LocaleType } from '~/i18n';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { ResetPasswordForm } from './_components/reset-password-form';
import { ResetPasswordFormFragment } from './_components/reset-password-form/fragment';

const ResetPageQuery = graphql(
  `
    query ResetPageQuery {
      site {
        settings {
          reCaptcha {
            ...ResetPasswordFormFragment
          }
        }
      }
    }
  `,
  [ResetPasswordFormFragment],
);

export const metadata = {
  title: 'Reset password',
};

interface Props {
  params: { locale: LocaleType };
}

export default async function Reset({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations('Reset');

  const { data } = await client.fetch({
    document: ResetPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  return (
    <div className="mx-auto my-6 max-w-4xl">
      <h2 className="mb-8 text-4xl font-black lg:text-5xl">{t('heading')}</h2>
      <ResetPasswordForm reCaptchaSettings={bypassReCaptcha(data.site.settings?.reCaptcha)} />
    </div>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const runtime = 'edge';
