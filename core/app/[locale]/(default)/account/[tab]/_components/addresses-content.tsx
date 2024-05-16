import { getLocale, getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { Pagination } from '../../../(faceted)/_components/pagination';
import { TabHeading } from '../_components/tab-heading';
import { TabType } from '../layout';

import { AddressesList } from './addresses-list';

type CustomerAddresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>;

interface Props {
  addresses: CustomerAddresses['addresses'];
  addressesCount: number;
  pageInfo: CustomerAddresses['pageInfo'];
  title: TabType;
}

export const AddressesContent = async ({ addresses, addressesCount, pageInfo, title }: Props) => {
  const locale = await getLocale();
  const tPagination = await getTranslations({ locale, namespace: 'Pagination' });
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      <TabHeading heading={title} locale={locale} />
      <AddressesList
        addressesCount={addressesCount}
        customerAddressBook={addresses}
        key={endCursor}
      />
      <Pagination
        endCursor={endCursor}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        nextLabel={tPagination('next')}
        prevLabel={tPagination('prev')}
        startCursor={startCursor}
      />
    </>
  );
};
