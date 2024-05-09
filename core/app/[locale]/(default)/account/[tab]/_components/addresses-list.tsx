import { useTranslations } from 'next-intl';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

type Addresses = NonNullable<Awaited<ReturnType<typeof getCustomerAddresses>>>['addresses'];

interface Props {
  customerAddressBook: Addresses;
}

const AddressChangeButtons = () => {
  const t = useTranslations('Account.Addresses');

  return (
    <div className="my-2 flex w-fit gap-x-2 divide-y-0">
      <Button aria-label={t('editButton')} variant="secondary">
        {t('editButton')}
      </Button>
      <Button aria-label={t('deleteButton')} variant="subtle">
        {t('deleteButton')}
      </Button>
    </div>
  );
};

export const AddressesList = ({ customerAddressBook }: Props) => {
  const t = useTranslations('Account.Addresses');

  return (
    <ul className="mb-12">
      {customerAddressBook.map(
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
            <AddressChangeButtons />
          </li>
        ),
      )}
      <li className="flex w-full border-collapse flex-col justify-start gap-2 border-t border-gray-200 pt-8">
        <Button aria-label={t('addNewAddress')} asChild className="w-fit hover:text-white">
          <Link href="/account/add-new-address">{t('addNewAddress')}</Link>
        </Button>
      </li>
    </ul>
  );
};
