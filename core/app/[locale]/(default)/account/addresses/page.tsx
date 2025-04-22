import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  fieldToFieldNameTransformer,
  formFieldTransformer,
  injectCountryCodeOptions,
} from '~/data-transformers/form-field-transformer';
import {
  ADDRESS_FORM_LAYOUT,
  mapFormFieldValueToName,
  transformFieldsToLayout,
} from '~/data-transformers/form-field-transformer/utils';
import { exists } from '~/lib/utils';
import { type Address, AddressListSection } from '~/ui/address-list-section';

import { addressAction } from './_actions/address-action';
import { getCustomerAddresses } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Account.Addresses' });

  return {
    title: t('title'),
  };
}

export default async function Addresses({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Addresses');
  const { before, after } = await searchParams;

  const data = await getCustomerAddresses({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!data) {
    notFound();
  }

  const { shippingAddressFields = [], countries } = data;

  const addresses = data.addresses.map<Address>((address) => ({
    id: address.entityId.toString(),
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2 ?? undefined,
    city: address.city,
    stateOrProvince: address.stateOrProvince ?? undefined,
    countryCode: address.countryCode,
    postalCode: address.postalCode ?? undefined,
    phone: address.phone ?? undefined,
    company: address.company ?? undefined,
    ...address.formFields.reduce((acc, field) => {
      return {
        ...acc,
        ...mapFormFieldValueToName(field),
      };
    }, {}),
  }));

  const fields = transformFieldsToLayout(shippingAddressFields, ADDRESS_FORM_LAYOUT)
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
    .filter(exists)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(fieldToFieldNameTransformer);
      }

      return fieldToFieldNameTransformer(field);
    })
    .filter(exists);

  return (
    <AddressListSection
      addressAction={addressAction}
      addresses={addresses}
      cancelLabel={t('cancel')}
      createLabel={t('create')}
      deleteLabel={t('delete')}
      editLabel={t('edit')}
      fields={[...fields, { name: 'id', type: 'hidden' }]}
      setDefaultLabel={t('setDefault')}
      showAddFormLabel={t('cta')}
      title={t('title')}
      updateLabel={t('update')}
    />
  );
}
