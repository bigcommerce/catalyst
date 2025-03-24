import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

// import { client } from '~/client';
// import { graphql } from '~/client/graphql';
// import { revalidate } from '~/client/revalidate-target';
// import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';

import { resetPassword } from './_actions/reset-password';

// TODO: add recaptcha token
// const ResetPageQuery = graphql(`
//   query ResetPageQuery {
//     site {
//       settings {
//         reCaptcha {
//           isEnabledOnStorefront
//           siteKey
//         }
//       }
//     }
//   }
// `);

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Login.ForgotPassword' });

  return {
    title: t('title'),
  };
}

export default async function Reset(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations('Login.ForgotPassword');

  // TODO: add recaptcha token
  // const { data } = await client.fetch({
  //   document: ResetPageQuery,
  //   fetchOptions: { next: { revalidate } },
  // });
  // const recaptchaSettings = await bypassReCaptcha(data.site.settings?.reCaptcha);

  return (
    <ForgotPasswordSection
      action={resetPassword}
      subtitle={t('Form.description')}
      title={t('heading')}
    />
  );
}
