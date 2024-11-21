'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect, useState } from 'react';

import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message';
import { useRouter } from '~/i18n/routing';

import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { deleteAddress } from '../_actions/delete-address';
import { SearchParams } from '../page';
import { getCustomerAddresses } from '../page-data';

export type Addresses = ExistingResultType<typeof getCustomerAddresses>['addresses'];

interface AddressChangeProps {
  addressId: number;
  isAddressRemovable: boolean;
  onDelete: (addresses: Addresses) => void;
  searchParams: SearchParams;
}

const AddressChangeButtons = ({
  addressId,
  isAddressRemovable,
  onDelete,
  searchParams,
}: AddressChangeProps) => {
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Addresses');

  const handleDeleteAddress = async () => {
    const result = await deleteAddress(addressId, searchParams);

    if (result.status === 'success' && result.addresses) {
      onDelete(result.addresses);

      setAccountState({
        status: 'success',
        message: result.message || '',
      });
    }
  };

  return (
    <div className="flex w-fit gap-x-2 divide-y-0">
      <Button aria-label={t('editButton')} asChild variant="secondary">
        <Link href={`/account/addresses/edit/${addressId}`}>{t('editButton')}</Link>
      </Button>
      <Modal
        actionHandler={handleDeleteAddress}
        confirmationText={t('confirmDeleteAddress')}
        title={t('deleteModalTitle')}
      >
        <Button aria-label={t('deleteButton')} disabled={!isAddressRemovable} variant="subtle">
          {t('deleteButton')}
        </Button>
      </Modal>
    </div>
  );
};

interface AddressBookProps {
  customerAddresses: Addresses;
  addressesCount: number;
  hasPreviousPage: boolean;
  startCursor: string | null;
  searchParams: SearchParams;
}

export const AddressBook = ({
  children,
  addressesCount,
  customerAddresses,
  hasPreviousPage,
  startCursor,
  searchParams,
}: PropsWithChildren<AddressBookProps>) => {
  const t = useTranslations('Account.Addresses');
  const [addressBook, setAddressBook] = useState(customerAddresses);
  const { accountState } = useAccountStatusContext();
  const router = useRouter();

  useEffect(() => {
    if (addressBook.length === 0 && hasPreviousPage) {
      router.push(`/account/addresses/?before=${startCursor}`);
    }
  }, [addressBook, hasPreviousPage, startCursor, router]);

  return (
    <>
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}
      {!addressesCount && <p className="border-t py-12 text-center">{t('emptyAddresses')}</p>}
      <ul className="mb-12">
        {addressBook.map(
          ({
            entityId,
            firstName,
            lastName,
            address1,
            address2,
            city,
            stateOrProvince,
            postalCode,
            countryCode,
          }) => (
            <li
              className="flex w-full border-collapse flex-col justify-start gap-3 border-t border-gray-200 py-6"
              key={entityId}
            >
              <div className="inline-flex flex-col justify-start text-base">
                <p>
                  {firstName} {lastName}
                </p>
                <p>{address1}</p>
                {Boolean(address2) && <p>{address2}</p>}
                <p>
                  {city}, {stateOrProvince} {postalCode}
                </p>
                <p>{countryCode}</p>
              </div>
              <AddressChangeButtons
                addressId={entityId}
                isAddressRemovable={addressesCount > 1}
                onDelete={setAddressBook}
                searchParams={searchParams}
              />
            </li>
          ),
        )}
        <li className="align-center flex w-full border-collapse flex-col justify-center gap-2 border-t border-gray-200 pt-8 md:flex-row md:justify-between">
          <Button
            aria-label={t('addNewAddress')}
            asChild
            className="w-full hover:text-white md:w-fit"
          >
            <Link href="/account/addresses/add">{t('addNewAddress')}</Link>
          </Button>
          {children}
        </li>
      </ul>
    </>
  );
};
