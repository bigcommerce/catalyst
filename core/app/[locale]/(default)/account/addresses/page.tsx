import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Address, AddressListSection } from '@/vibes/soul/sections/address-list-section';
import { ADDRESS_FORM_LAYOUT, FieldNameToFieldId } from '~/components/form-fields';
import { FormField } from '~/components/form-fields/fragment';
import { formFieldTransformer } from '~/data-transformers/form-field-transformer';
import { exists } from '~/lib/utils';

import { addressAction } from './_actions/address-action';
import { getCustomerAddresses } from './page-data';

function transformToLayout(data: FormField[]): Array<FormField | FormField[]> {
  const fieldMap = new Map(data.map((field) => [field.entityId, field]));

  const hardLayout = ADDRESS_FORM_LAYOUT.map((row) => {
    if (Array.isArray(row)) {
      return row.map((fieldId) => fieldMap.get(fieldId)).filter<FormField>(exists);
    }

    return fieldMap.get(row);
  }).filter<FormField | FormField[]>(exists);

  const usedFieldIds = new Set(
    ADDRESS_FORM_LAYOUT.flatMap((row) => (Array.isArray(row) ? row : [row])),
  );

  const remainingFields: FormField[] = data.filter((field) => !usedFieldIds.has(field.entityId));

  return [...hardLayout, ...remainingFields];
}

interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export async function generateMetadata() {
  const t = await getTranslations('Account.Addresses');

  return {
    title: t('title'),
  };
}

export default async function Addresses({ searchParams }: Props) {
  const { before, after } = await searchParams;

  const data = await getCustomerAddresses({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!data) {
    notFound();
  }

  const { shippingAddressFields = [] } = data;

  const addresses = data.addresses.map<Address>((address) => ({
    ...address,
    id: address.entityId.toString(),
    street1: address.address1,
    street2: address.address2 ?? undefined,
    state: address.stateOrProvince ?? undefined,
    country: address.countryCode,
    postalCode: address.postalCode ?? undefined,
    phone: address.phone ?? undefined,
    company: address.company ?? undefined,
    fieldMetadata: [
      ...address.formFields.map((field) => {
        const metadata: { id: number; defaultValue: string | string[] } = {
          id: field.entityId,
          defaultValue: '',
        };

        switch (field.__typename) {
          case 'CheckboxesFormFieldValue':
            metadata.defaultValue = field.valueEntityIds.map(String);

            return metadata;

          case 'DateFormFieldValue':
            metadata.defaultValue = field.date.utc;

            return metadata;

          case 'MultipleChoiceFormFieldValue':
            metadata.defaultValue = field.valueEntityId.toString();

            return metadata;

          case 'NumberFormFieldValue':
            metadata.defaultValue = field.number.toString();

            return metadata;

          case 'PasswordFormFieldValue':
            metadata.defaultValue = field.password;

            return metadata;

          case 'TextFormFieldValue':
            metadata.defaultValue = field.text;

            return metadata;

          case 'MultilineTextFormFieldValue':
            metadata.defaultValue = field.multilineText;

            return metadata;

          default:
            return metadata;
        }
      }),
      // For built-in fields in BigCommerce, we need a way to map the field
      // name with the value in order to populate the dynamic form data:
      { id: FieldNameToFieldId.firstName, defaultValue: address.firstName },
      { id: FieldNameToFieldId.lastName, defaultValue: address.lastName },
      { id: FieldNameToFieldId.company, defaultValue: address.company },
      { id: FieldNameToFieldId.phone, defaultValue: address.phone },
      { id: FieldNameToFieldId.address1, defaultValue: address.address1 },
      { id: FieldNameToFieldId.address2, defaultValue: address.address2 },
      { id: FieldNameToFieldId.city, defaultValue: address.city },
      { id: FieldNameToFieldId.stateOrProvince, defaultValue: address.stateOrProvince },
      { id: FieldNameToFieldId.postalCode, defaultValue: address.postalCode },
      { id: FieldNameToFieldId.countryCode, defaultValue: address.countryCode },
    ],
  }));

  const fields = transformToLayout(shippingAddressFields)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(formFieldTransformer).filter(exists);
      }

      return formFieldTransformer(field);
    })
    .filter(exists);

  return <AddressListSection addressAction={addressAction} addresses={addresses} fields={fields} />;
}
