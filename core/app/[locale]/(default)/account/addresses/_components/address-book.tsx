'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';
import { toast } from 'react-hot-toast';

import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

import { Modal } from '../../_components/modal';
import { deleteAddress } from '../_actions/delete-address';
import { getCustomerAddresses } from '../page-data';

export type Addresses = ExistingResultType<typeof getCustomerAddresses>['addresses'];

interface AddressBookProps {
  customerAddresses: Addresses;
  totalAddresses: number;
}

export const AddressBook = ({
  children,
  totalAddresses,
  customerAddresses,
}: PropsWithChildren<AddressBookProps>) => {
  const t = useTranslations('Account.Addresses');

  const handleDeleteAddress = (addressId: number) => async () => {
    const { status, message } = await deleteAddress(addressId);

    if (status === 'error') {
      toast.error(message, {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(message, {
      icon: <Check className="text-success-secondary" />,
    });
  };

  return (
    <>
      {totalAddresses === 0 && <p className="border-t py-12 text-center">{t('emptyAddresses')}</p>}
      <ul className="mb-12">
        {customerAddresses.map(
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
              <div className="flex w-fit gap-x-2 divide-y-0">
                <Button aria-label={t('editButton')} asChild variant="secondary">
                  <Link href={`/account/addresses/edit/${entityId}`}>{t('editButton')}</Link>
                </Button>
                <Modal
                  actionHandler={handleDeleteAddress(entityId)}
                  confirmationText={t('confirmDeleteAddress')}
                  title={t('deleteModalTitle')}
                >
                  <Button
                    aria-label={t('deleteButton')}
                    disabled={totalAddresses === 1}
                    variant="subtle"
                  >
                    {t('deleteButton')}
                  </Button>
                </Modal>
              </div>
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
