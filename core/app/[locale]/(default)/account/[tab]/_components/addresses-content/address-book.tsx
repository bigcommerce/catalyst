'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message';

import { deleteAddress } from '../../_actions/delete-address';
import { useAccountStatusContext } from '../account-status-provider';
import { Modal } from '../modal';

export type Addresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>['addresses'];

interface AddressChangeProps {
  addressId: number;
  isAddressRemovable: boolean;
  onDelete: (state: Addresses | ((prevState: Addresses) => Addresses)) => void;
}

const AddressChangeButtons = ({ addressId, isAddressRemovable, onDelete }: AddressChangeProps) => {
  const t = useTranslations('Account.Addresses');

  const handleDeleteAddress = async () => {
    const { status } = await deleteAddress(addressId);

    if (status === 'success') {
      onDelete((prevAddressBook) =>
        prevAddressBook.filter(({ entityId }) => entityId !== addressId),
      );
    }
  };

  return (
    <div className="my-2 flex w-fit gap-x-2 divide-y-0">
      <Button aria-label={t('editButton')} asChild variant="secondary">
        <Link
          href={{
            pathname: '/account/addresses',
            query: { action: 'edit-address', 'address-id': addressId },
          }}
        >
          {t('editButton')}
        </Link>
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
}

export const AddressBook = ({ addressesCount, customerAddresses }: AddressBookProps) => {
  const t = useTranslations('Account.Addresses');
  const [addressBook, setAddressBook] = useState(customerAddresses);
  const { accountState } = useAccountStatusContext();

  return (
    <>
      {(accountState.status === 'error' || accountState.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}
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
              className="flex w-full border-collapse flex-col justify-start gap-2 border-t border-gray-200 pb-3 pt-5"
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
              />
            </li>
          ),
        )}
        <li className="flex w-full border-collapse flex-col justify-start gap-2 border-t border-gray-200 pt-8">
          <Button aria-label={t('addNewAddress')} asChild className="w-fit hover:text-white">
            <Link href={{ pathname: '/account/addresses', query: { action: 'add-new-address' } }}>
              {t('addNewAddress')}
            </Link>
          </Button>
        </li>
      </ul>
    </>
  );
};
