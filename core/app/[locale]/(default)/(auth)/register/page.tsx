// import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SignUpSection } from '@/vibes/soul/sections/sign-up-section';
// import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { registerCustomer } from './_actions/register-customer';
// import { getRegisterCustomerQuery } from './page-data';

export async function generateMetadata() {
  const t = await getTranslations('Register');

  return {
    title: t('title'),
  };
}

export default async function Register() {
  const t = await getTranslations('Register');

  // TODO: add dynamic fields from GQL
  // const registerCustomerData = await getRegisterCustomerQuery({
  //   address: { sortBy: 'SORT_ORDER' },
  //   customer: { sortBy: 'SORT_ORDER' },
  // });

  // if (!registerCustomerData) {
  //   notFound();
  // }

  // const { addressFields, customerFields, reCaptchaSettings } = registerCustomerData;

  return (
    <SignUpSection action={registerCustomer} submitLabel={t('Form.submit')} title={t('heading')} />
  );
}

export const runtime = 'edge';
