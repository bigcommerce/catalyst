import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import {
  formFieldTransformer,
  injectCountryCodeOptions,
} from '~/data-transformers/form-field-transformer';
import {
  CUSTOMER_FIELDS_TO_EXCLUDE,
  REGISTER_CUSTOMER_FORM_LAYOUT,
  transformFieldsToLayout,
} from '~/data-transformers/form-field-transformer/utils';
import { exists } from '~/lib/utils';

import { ADDRESS_FIELDS_NAME_PREFIX, CUSTOMER_FIELDS_NAME_PREFIX } from './_actions/prefixes';
import { registerCustomer } from './_actions/register-customer';
import { getRegisterCustomerQuery } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Register' });

  return {
    title: t('title'),
  };
}

export default async function Register({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Register');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const { addressFields, customerFields, countries } = registerCustomerData;

  const fields = transformFieldsToLayout(
    [
      ...addressFields.map((field) => {
        if (!field.isBuiltIn) {
          return {
            ...field,
            name: `${ADDRESS_FIELDS_NAME_PREFIX}${field.label}`,
          };
        }

        return field;
      }),
      ...customerFields.map((field) => {
        if (!field.isBuiltIn) {
          return {
            ...field,
            name: `${CUSTOMER_FIELDS_NAME_PREFIX}${field.label}`,
          };
        }

        return field;
      }),
    ].filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId)),
    REGISTER_CUSTOMER_FORM_LAYOUT,
  )
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(formFieldTransformer).filter(exists);
      }

      return formFieldTransformer(field);
    })
    .filter(exists)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map((f) => injectCountryCodeOptions(f, countries ?? []));
      }

      return injectCountryCodeOptions(field, countries ?? []);
    })
    .filter(exists);

  return (
    <DynamicFormSection
      action={registerCustomer}
      fields={fields}
      submitLabel={t('cta')}
      title={t('heading')}
    />
  );
}
