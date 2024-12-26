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
    <div className="flex items-center gap-[22px] p-0">
      <Button
        className="flex min-w-[174px] items-center justify-center gap-[5px] rounded-[3px] bg-[#03465c] hover:bg-[#03465c]/90 p-[5px_10px] text-[14px] font-[500] uppercase leading-[32px] tracking-[1.25px] text-white"
        aria-label={t('editButton')}
        asChild
        variant="secondary"
      >
        <Link href={`/account/addresses/edit/${addressId}`}>{t('editButton')}</Link>
      </Button>
      <Modal
        actionHandler={handleDeleteAddress}
        confirmationText={t('confirmDeleteAddress')}
        title={t('deleteModalTitle')}
      >
        <Button
          className="flex min-w-[174px] items-center justify-center gap-[5px] rounded-[3px] bg-[#03465c] hover:bg-[#03465c]/90 p-[5px_10px] text-[14px] font-[500] uppercase leading-[32px] tracking-[1.25px] text-white"
          aria-label={t('deleteButton')}
          disabled={!isAddressRemovable}
          variant="subtle"
        >
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
      {!addressesCount && <p className="border-t py-12 text-center">{t('emptyAddresses')}</p>}
      <ul className="flex flex-wrap gap-5">
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
            <li className="flex w-fit items-start gap-[10px] bg-[#E8E7E7] p-10" key={entityId}>
              <div className="flex flex-col items-start gap-[30px] p-0 h-full">
                <p className="text-xl font-[500] leading-[32px] tracking-[0.15px] text-black">
                  {firstName} {lastName}
                </p>
                <div className="text-[16px] font-normal leading-[32px] tracking-[0.5px] text-black flex-grow">
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
              </div>
            </li>
          ),
        )}
      </ul>
      <div className="">
        <Button aria-label={t('addNewAddress')} asChild className="w-fit">
          <Link href="/account/addresses/add">{t('addNewAddress')}</Link>
        </Button>
        {children}
      </div>
    </>
  );
};
