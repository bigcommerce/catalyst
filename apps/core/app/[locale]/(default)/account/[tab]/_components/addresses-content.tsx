import { getLocale, getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { Pagination } from '../../../(faceted)/_components/pagination';
import { TabType } from '../layout';
import { tabHeading } from '../page';

import { AddressesList } from './addresses-list';

type CustomerAddresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>;

interface Props {
  addresses: CustomerAddresses['addresses'];
  pageInfo: CustomerAddresses['pageInfo'];
  title: TabType;
}

export const AddressesContent = async ({ addresses, pageInfo, title }: Props) => {
  const locale = await getLocale();
  const tPagination = await getTranslations({ locale, namespace: 'Pagination' });
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      {tabHeading(title, locale)}
      <AddressesList customerAddressBook={addresses} />
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
