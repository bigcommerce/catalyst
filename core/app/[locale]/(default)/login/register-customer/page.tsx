import { notFound, redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { auth } from '~/auth';
import { LocaleType } from '~/i18n';

import { RegisterCustomerForm } from './_components/register-customer-form';
import { getRegisterCustomerQuery } from './page-data';

interface Props {
  params: {
    locale: LocaleType;
  };
}

const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
};

export default async function RegisterCustomer({ params: { locale } }: Props) {
  const session = await auth();

  if (session) {
    redirect('/account');
  }

  const messages = await getMessages({ locale });
  const Account = messages.Account ?? {};
  const t = await getTranslations({ locale, namespace: 'Account.Register' });

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
      <NextIntlClientProvider locale={locale} messages={{ Account }}>
        <RegisterCustomerForm
          addressFields={addressFields}
          countries={countries}
          customerFields={customerFields}
          defaultCountry={{ entityId, code, states: statesOrProvinces ?? [] }}
          reCaptchaSettings={reCaptchaSettings}
        />
      </NextIntlClientProvider>
    </div>
  );
}
