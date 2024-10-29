import { getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import {Breadcrumbs as ComponentsBreadcrumbs} from '~/components/ui/breadcrumbs'

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

  const breadcrumbs: any = [{
    label: "Forgot Password",
    href: '#'
  }];

  const { data } = await client.fetch({
    document: ResetPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  return (
    <div className="reset-pass mt-6 mx-auto">
      <ComponentsBreadcrumbs className="" breadcrumbs={breadcrumbs} />
      <h2 className="reset-pass-head text-[34px] font-normal text-center tracking-[0.25px] text-[#353535]">{t('heading')}</h2>
      <ResetPasswordForm reCaptchaSettings={bypassReCaptcha(data.site.settings?.reCaptcha)} />
    </div>
  );
}

export const runtime = 'edge';
