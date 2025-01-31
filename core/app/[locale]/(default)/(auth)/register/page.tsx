import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

// TODO: Add recaptcha token
// import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { formFieldTransformer } from '~/data-transformers/form-field-transformer';
import {
  CUSTOMER_FIELDS_TO_EXCLUDE,
  FULL_NAME_FIELDS,
} from '~/data-transformers/form-field-transformer/utils';
import { exists } from '~/lib/utils';

import { registerCustomer } from './_actions/register-customer';
import { getRegisterCustomerQuery } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ namespace: 'Register', locale });

  return {
    title: t('title'),
  };
}

export default async function Register({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Register');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const { addressFields, customerFields } = registerCustomerData;
  // const reCaptcha = await bypassReCaptcha(reCaptchaSettings);

  return (
    <DynamicFormSection
      action={registerCustomer}
      fields={[
        addressFields
          .filter((field) => FULL_NAME_FIELDS.includes(field.entityId))
          .map(formFieldTransformer)
          .filter(exists),
        ...customerFields
          .filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId))
          .map(formFieldTransformer)
          .filter(exists),
      ]}
      submitLabel={t('Form.submit')}
      title={t('heading')}
    />
  );
}

export const experimental_ppr = false;
