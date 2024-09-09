'use client';

import { useTranslations } from 'next-intl';
import { PropsWithChildren, useState } from 'react';

import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { deleteAddress } from '../_actions/delete-address';
import { getCustomerAddresses } from '../page-data';

export type Addresses = ExistingResultType<typeof getCustomerAddresses>['addresses'];

interface AddressChangeProps {
  addressId: number;
  isAddressRemovable: boolean;
  onDelete: (state: Addresses | ((prevState: Addresses) => Addresses)) => void;
}

const AddressChangeButtons = ({ addressId, isAddressRemovable, onDelete }: AddressChangeProps) => {
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Addresses');

  const handleDeleteAddress = async () => {
    const submit = await deleteAddress(addressId);

    if (submit.status === 'success') {
      onDelete((prevAddressBook) =>
        prevAddressBook.filter(({ entityId }) => entityId !== addressId),
      );

      setAccountState({
        status: 'success',
        message: submit.message || '',
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
}

export const AddressBook = ({
  children,
  addressesCount,
  customerAddresses,
}: PropsWithChildren<AddressBookProps>) => {
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
