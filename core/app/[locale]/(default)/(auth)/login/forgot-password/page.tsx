import { getTranslations } from 'next-intl/server';

import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';
// import { client } from '~/client';
// import { graphql } from '~/client/graphql';
// import { revalidate } from '~/client/revalidate-target';
// import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { resetPassword } from '../_actions/reset-password';

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

export async function generateMetadata() {
  const t = await getTranslations('Login.ForgotPassword');

  return {
    title: t('title'),
  };
}

export default async function Reset() {
  const t = await getTranslations('Login.ForgotPassword');

  // TODO: recaptcha
  // const { data } = await client.fetch({
  //   document: ResetPageQuery,
  //   fetchOptions: { next: { revalidate } },
  // });

  // TODO: add missing translations labels
  return (
    <ForgotPasswordSection
      action={resetPassword}
      submitLabel={t('Form.submit')}
      subtitle={t('Form.description')}
      title={t('heading')}
    />
  );
}

export const runtime = 'edge';
