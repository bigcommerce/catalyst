import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterCustomerForm } from './_components/register-customer-form';
import { getRegisterCustomerQuery } from './page-data';

const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
};

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

  const {
    addressFields,
    customerFields,
    countries,
    defaultCountry = FALLBACK_COUNTRY.name,
    reCaptchaSettings,
  } = registerCustomerData;

  const {
    code = FALLBACK_COUNTRY.code,
    entityId = FALLBACK_COUNTRY.entityId,
    statesOrProvinces,
  } = countries.find(({ name }) => name === defaultCountry) || {};

  return (
    <div className="mx-auto mb-10 mt-8 text-base lg:w-2/3">
      <h1 className="my-6 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
      <RegisterCustomerForm
        addressFields={addressFields}
        countries={countries}
        customerFields={customerFields}
        defaultCountry={{ entityId, code, states: statesOrProvinces ?? [] }}
        reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
      />
    </div>
  );
}

export const runtime = 'edge';
