import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../_components/tab-heading';

import { AddressBook } from './_components/address-book';
import { getCustomerAddresses } from './page-data';

export interface SearchParams {
  [key: string]: string | string[] | undefined;
  before?: string;
  after?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
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

  const { addresses, pageInfo, addressesCount } = data;
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      <TabHeading heading="addresses" />
      <AddressBook
        addressesCount={addressesCount}
        customerAddresses={addresses}
        hasPreviousPage={hasPreviousPage}
        key={startCursor}
        searchParams={{ before, after }}
        startCursor={startCursor}
      >
        <Pagination
          className="my-0 inline-flex justify-center text-center"
          endCursor={endCursor ?? undefined}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          startCursor={startCursor ?? undefined}
        />
      </AddressBook>
    </>
  );
}

export const runtime = 'edge';
