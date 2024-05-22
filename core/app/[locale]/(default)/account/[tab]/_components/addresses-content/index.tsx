import { getLocale, getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { Pagination } from '../../../../(faceted)/_components/pagination';
import { TabType } from '../../layout';
import { TabHeading } from '../tab-heading';

import { AddressBook } from './address-book';
import { CustomerNewAddress } from './customer-new-address';

type CustomerAddresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>;

interface Props {
  addresses: CustomerAddresses['addresses'];
  addressesCount: number;
  customerAction?: 'add-new-address';
  pageInfo: CustomerAddresses['pageInfo'];
  title: TabType;
}

export const AddressesContent = async ({
  addresses,
  addressesCount,
  customerAction,
  pageInfo,
  title,
}: Props) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Home' });
  const tPagination = await getTranslations({ locale, namespace: 'Pagination' });
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  if (customerAction === 'add-new-address') {
    return (
      <div className="mx-auto mb-14 lg:w-2/3">
        <h1 className="my-8 text-3xl font-black lg:text-4xl">{t('newAddress')}</h1>
        <CustomerNewAddress />
      </div>
    );
  }

  return (
    <>
      <TabHeading heading={title} locale={locale} />
      <AddressBook addressesCount={addressesCount} customerAddresses={addresses} key={endCursor} />
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
