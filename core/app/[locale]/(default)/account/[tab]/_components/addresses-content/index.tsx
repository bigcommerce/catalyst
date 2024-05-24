import { getLocale, getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { Pagination } from '../../../../(faceted)/_components/pagination';
import { TabHeading } from '../tab-heading';

import { AddressBook } from './address-book';
import { CustomerEditAddress } from './customer-edit-address';
import { CustomerNewAddress } from './customer-new-address';

type CustomerAddresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>;

interface Props {
  addresses: CustomerAddresses['addresses'];
  activeAddressId?: string;
  addressesCount: number;
  customerAction?: 'add-new-address' | 'edit-address';
  pageInfo: CustomerAddresses['pageInfo'];
}

export const AddressesContent = async ({
  addresses,
  addressesCount,
  activeAddressId,
  customerAction,
  pageInfo,
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

  if (customerAction === 'edit-address' && activeAddressId) {
    const activeAddress = addresses
      .filter(({ entityId }) => entityId.toString() === activeAddressId)
      .shift();

    return (
      <div className="mx-auto mb-14 lg:w-2/3">
        <h1 className="my-8 text-3xl font-black lg:text-4xl">{t('editAddress')}</h1>
        {activeAddress && Object.keys(activeAddress).length > 0 ? (
          <CustomerEditAddress address={activeAddress} isAddressRemovable={addresses.length > 1} />
        ) : null}
      </div>
    );
  }

  return (
    <>
      <TabHeading heading="addresses" />
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
