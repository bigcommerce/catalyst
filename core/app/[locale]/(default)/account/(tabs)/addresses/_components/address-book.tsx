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
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Addresses');

  const handleDeleteAddress = async () => {
    scrollToTop();
  
    const submit = await deleteAddress(addressId);
  
    if (submit?.status === 'success') {
      onDelete((prevAddressBook) => {
        const updatedAddresses = prevAddressBook.filter(({ entityId }) => entityId !== addressId);
  
        // Handle case where no addresses remain
        if (updatedAddresses.length === 0) {
          return [];
        }
  
        return updatedAddresses;
      });
  
      setAccountState({
        status: 'success',
        message: submit.message || 'Address deleted successfully',
      });
    } else {
      setAccountState({
        status: 'error',
        message: submit?.message || 'Failed to delete address',
      });
    }
  };
  

  return (
    <div className="flex gap-4 w-full max-w-full  justify-center ">
    <Button
      className="flex-1 basis-0 flex items-center justify-center gap-2 rounded-md bg-[#008BB7] px-4 py-2 text-sm font-medium uppercase leading-6 tracking-wider text-white hover:bg-[#03465c]/90 w-[150px] min-w-[120px] text-center"
      aria-label={t('editButton')}
      asChild
      variant="secondary" 
    >
      <Link className="w-full text-center" href={`/account/addresses/edit/${addressId}`}>
        {t('editButton')}
      </Link>
    </Button>
  
    <Modal
      actionHandler={handleDeleteAddress}
      confirmationText={t('yesDelete')} 
      title={t('deleteModalTitle')}
      abortText={t('noDelete')}
      from="address"
    >
      <Button
        className="flex-[1_0_1%] flex items-center  justify-center gap-2 text-[#002A37] rounded-md bg-[#FFF] px-4 py-2 text-sm font-medium uppercase leading-6 tracking-wider hover:bg-gray-100 w-[150px] min-w-[120px] text-center border border-gray-300"
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
        <Message className="w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}
      
      <div className=" gap-[30px] px-10 py-3">
      {!addressesCount && <p className="border-t py-12 text-center">{t('emptyAddresses')}</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-1  md:grid-cols-1 lg:grid-cols-3 gap-4">
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
              className="flex w-full flex-col items-start gap-1 rounded-lg bg-[#E8E7E7] p-5 sm:flex-row sm:p-8"
              key={entityId}
            >
              {/* Container div for text and buttons */}
              <div className="flex h-full w-full flex-col gap-4 sm:gap-6">
                {/* Name */}
                <p className="text-lg font-medium break-all leading-[28px] tracking-wide text-black sm:text-xl sm:leading-[32px]">
                  {firstName} {lastName}
                </p>

                {/* Address details */}
                <div className="flex-grow text-sm font-normalbreak-all  leading-[24px] tracking-wide text-black sm:text-base sm:leading-[28px]">
                  <p>{address1}</p>
                  {Boolean(address2) && <p>{address2}</p>}
                  <p>
                    {city}, {stateOrProvince} {postalCode}
                  </p>
                  <p>{countryCode}</p>
                </div>

                {/* Address change buttons */}
              
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

        <Button aria-label={t('addNewAddress')} asChild className="w-fit bg-[#03465C] mt-[30px]">
          <Link href="/account/addresses/add">{t('addNewAddress')}</Link>
        </Button>
        {children}
      </div>
    </>
  );
};
