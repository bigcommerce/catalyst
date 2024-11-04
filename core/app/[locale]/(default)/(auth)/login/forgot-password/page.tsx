import { getTranslations } from 'next-intl/server';

import { ResetPasswordSection } from '@/vibes/soul/sections/reset-password-section';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { resetPassword } from './_actions/reset-password';
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

export async function generateMetadata() {
  const t = await getTranslations('Login.ForgotPassword');

  return {
    title: t('title'),
  };
}

export default async function Reset() {
  const t = await getTranslations('Login.ForgotPassword');

  const { data } = await client.fetch({
    document: ResetPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  // TODO: recaptcha and action
  return (
    <ResetPasswordSection
      action={resetPassword}
      submitLabel={t('Form.submit')}
      subtitle={t('Form.description')}
      title={t('heading')}
    />
  );
}

export const runtime = 'edge';
