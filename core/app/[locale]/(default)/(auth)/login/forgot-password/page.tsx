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
    <div className="reset-pass w-[100%] md:w-[calc((1116 / 1600) * 100vw)] flex flex-col gap-[20px] md:gap-[8px] justify-center mt-6 mx-[0px] md:mx-auto">
      <ComponentsBreadcrumbs className="" breadcrumbs={breadcrumbs} />
      <h2 className="reset-pass-head text-[24px] md:text-[34px] font-normal text-center tracking-[0.25px] text-[#353535]">{t('heading')}</h2>
      <ResetPasswordForm reCaptchaSettings={bypassReCaptcha(data.site.settings?.reCaptcha)} />
    </div>
  );
}

export const runtime = 'edge';
