import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

// TODO: Add recaptcha token
// import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { SignUpSection } from '@/vibes/soul/sections/sign-up-section';
import { formFieldTransformer } from '~/data-transformers/form-field-transformer';
import {
  CUSTOMER_FIELDS_TO_EXCLUDE,
  FULL_NAME_FIELDS,
} from '~/data-transformers/form-field-transformer/utils';
import { exists } from '~/lib/utils';

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

  const { addressFields, customerFields } = registerCustomerData;
  // const reCaptcha = await bypassReCaptcha(reCaptchaSettings);

  return (
    <SignUpSection
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
