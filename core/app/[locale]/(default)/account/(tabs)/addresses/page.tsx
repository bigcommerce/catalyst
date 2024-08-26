import { notFound } from 'next/navigation';

import { TabHeading } from '../_components/tab-heading';

import { AddressesContent } from './_components/addresses-content';
import { getCustomerAddresses } from './page-data';

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
    action?: 'add-new-address' | 'edit-address';
    before?: string;
    after?: string;
  };
}

export default async function AddressesPage({ searchParams }: Props) {
  const { before, after, action } = searchParams;
  const customerAddressesDetails = await getCustomerAddresses({
    ...(after && { after }),
    ...(before && { before }),
    limit: action === 'edit-address' ? undefined : 2,
  });

  if (!customerAddressesDetails) {
    notFound();
  }

  const { addresses, pageInfo, addressesCount } = customerAddressesDetails;

  return (
    <>
      <TabHeading heading="addresses" />
      <AddressesContent
        activeAddressId={searchParams['address-id']?.toString()}
        addresses={addresses}
        addressesCount={addressesCount}
        customerAction={action}
        pageInfo={pageInfo}
      />
    </>
  );
}

export const runtime = 'edge';
