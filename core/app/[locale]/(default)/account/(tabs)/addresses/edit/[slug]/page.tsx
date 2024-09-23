import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FormFieldValuesFragment } from '~/client/fragments/form-fields-values';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, ResultOf } from '~/client/graphql';
import { FormFieldsFragment } from '~/components/form-fields/fragment';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { EditAddressForm } from './_components/edit-address-form';

const CustomerEditAddressQuery = graphql(
  `
    query CustomerEditAddressQuery(
      $countryCode: String
      $shippingFilters: FormFieldFiltersInput
      $shippingSorting: FormFieldSortInput
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
      customer {
        entityId
        addresses(before: $before, after: $after, first: $first, last: $last) {
          pageInfo {
            ...PaginationFragment
          }
          collectionInfo {
            totalItems
          }
          edges {
            node {
              entityId
              firstName
              lastName
              address1
              address2
              city
              stateOrProvince
              countryCode
              phone
              postalCode
              company
              formFields {
                ...FormFieldValuesFragment
              }
            }
          }
        }
      }
      site {
        settings {
          contact {
            country
          }
          reCaptcha {
            isEnabledOnStorefront
            siteKey
          }
          formFields {
            shippingAddress(filters: $shippingFilters, sortBy: $shippingSorting) {
              ...FormFieldsFragment
            }
          }
        }
      }
      geography {
        countries(filters: { code: $countryCode }) {
          __typename
          name
          entityId
          code
          statesOrProvinces {
            __typename
            entityId
            name
            abbreviation
          }
        }
      }
    }
  `,
  [FormFieldsFragment, PaginationFragment, FormFieldValuesFragment],
);

export type CustomerEditAddressQueryResult = ResultOf<typeof CustomerEditAddressQuery>;

export async function generateMetadata() {
  const t = await getTranslations('Account.Addresses.Edit');

  return {
    title: t('title'),
  };
}

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Edit({ params: { slug } }: Props) {
  const t = await getTranslations('Account.Addresses.Edit');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CustomerEditAddressQuery,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: {
      countryCode: null,
      shippingSorting: 'SORT_ORDER',
    },
  });

  const reCaptchaSettings = data.site.settings?.reCaptcha;
  const countries = data.geography.countries;
  const addressFields = [...(data.site.settings?.formFields.shippingAddress ?? [])];
  const addresses = removeEdgesAndNodes({ edges: data.customer?.addresses.edges });

  if (addresses.length === 0) {
    return notFound();
  }

  const existingAddress = addresses.find((address) => address.entityId.toString() === slug);

  if (!existingAddress) {
    return notFound();
  }

  return (
    <div className="mx-auto mb-14 lg:w-2/3">
      <h1 className="mb-8 text-3xl font-black lg:text-4xl">{t('heading')}</h1>
      <EditAddressForm
        address={existingAddress}
        addressFields={addressFields}
        countries={countries || []}
        isAddressRemovable={addresses.length > 1}
        reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
      />
    </div>
  );
}

export const runtime = 'edge';
