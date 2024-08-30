import { useTranslations } from 'next-intl';

import { ExistingResultType } from '~/client/util';
import { Pagination } from '~/components/ui/pagination';

import { getCustomerAddresses } from '../page-data';

import { AddressBook } from './address-book';
import { CustomerEditAddress } from './customer-edit-address';
import { CustomerNewAddress } from './customer-new-address';

type CustomerAddresses = ExistingResultType<typeof getCustomerAddresses>;

interface Props {
  addresses: CustomerAddresses['addresses'];
  activeAddressId?: string;
  addressesCount: number;
  customerAction?: 'add-new-address' | 'edit-address';
  pageInfo: CustomerAddresses['pageInfo'];
}

export const AddressesContent = ({
  addresses,
  addressesCount,
  activeAddressId,
  customerAction,
  pageInfo,
}: Props) => {
  const t = useTranslations('Account.Addresses');

  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  if (customerAction === 'add-new-address') {
    return (
      <div className="mx-auto mb-14 lg:w-2/3">
        <h1 className="mb-8 text-3xl font-black lg:text-4xl">{t('newAddress')}</h1>
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
        <h1 className="mb-8 text-3xl font-black lg:text-4xl">{t('editAddress')}</h1>
        {activeAddress && Object.keys(activeAddress).length > 0 ? (
          <CustomerEditAddress address={activeAddress} isAddressRemovable={addresses.length > 1} />
        ) : null}
      </div>
    );
  }

  return (
    <AddressBook addressesCount={addressesCount} customerAddresses={addresses} key={endCursor}>
      <Pagination
        className="my-0 inline-flex justify-center text-center"
        endCursor={endCursor ?? undefined}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        startCursor={startCursor ?? undefined}
      />
    </AddressBook>
  );
};
