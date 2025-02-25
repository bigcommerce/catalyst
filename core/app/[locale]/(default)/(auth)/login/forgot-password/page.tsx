import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// import { client } from '~/client';
// import { graphql } from '~/client/graphql';
// import { anonymousCachePolicy } from '~/client/cache-policy';
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Login.ForgotPassword');

  return {
    title: t('title'),
  };
}

export default async function Reset() {
  const t = await getTranslations('Login.ForgotPassword');

  // TODO: add recaptcha token
  // const { data } = await client.fetch({
  //   document: ResetPageQuery,
  //   fetchOptions: anonymousCachePolicy(),
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
