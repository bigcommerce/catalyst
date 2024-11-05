import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SignUpSection } from '@/vibes/soul/sections/sign-up-section';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { registerCustomer } from './_actions/register-customer';
import { getRegisterCustomerQuery } from './page-data';

export async function generateMetadata() {
  const t = await getTranslations('Register');

  return {
    title: t('title'),
  };
}

export default async function Register() {
  const t = await getTranslations('Register');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const { addressFields, customerFields, reCaptchaSettings } = registerCustomerData;

  return (
    // <div className="mx-auto mb-10 mt-8 text-base lg:w-2/3">
    //   <h1 className="my-6 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
    //   <RegisterCustomerForm
    //     addressFields={addressFields}
    //     customerFields={customerFields}
    //     reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
    //   />
    // </div>
    <SignUpSection action={registerCustomer} submitLabel={t('submit')} title={t('heading')} />
  );
}

export const runtime = 'edge';
