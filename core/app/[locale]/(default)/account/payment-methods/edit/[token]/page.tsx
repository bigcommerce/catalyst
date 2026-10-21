import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

import { updateBillingAddress } from './_actions/update-billing-address';
import { getStoredPaymentInstrument } from './page-data';

interface Props {
  params: Promise<{ locale: string; token: string }>;
}

const FIELDS = [
  { name: 'firstName', label: 'First name', required: true },
  { name: 'lastName', label: 'Last name' },
  { name: 'email', label: 'Email' },
  { name: 'company', label: 'Company' },
  { name: 'address1', label: 'Address line 1', required: true },
  { name: 'address2', label: 'Address line 2' },
  { name: 'city', label: 'City', required: true },
  { name: 'stateOrProvince', label: 'State / province' },
  { name: 'stateOrProvinceCode', label: 'State / province code' },
  { name: 'postalCode', label: 'Postal code' },
  { name: 'countryCode', label: 'Country code (e.g. US)', required: true },
  { name: 'phone', label: 'Phone' },
] as const;

export default async function EditPaymentMethod({ params }: Props) {
  const { locale, token: encodedToken } = await params;

  setRequestLocale(locale);

  const token = decodeURIComponent(encodedToken);
  const instrument = await getStoredPaymentInstrument(token);

  if (!instrument || instrument.details.__typename !== 'StoredCard') {
    return notFound();
  }

  const { last4, billingAddress } = instrument.details;

  return (
    <>
      <h1 className="mb-4 text-4xl font-medium">Edit billing address</h1>
      <p className="mb-4">{`Card •••• ${last4}`}</p>
      <form action={updateBillingAddress} className="mb-4 flex max-w-md flex-col gap-3">
        <input name="token" type="hidden" value={token} />
        <input name="locale" type="hidden" value={locale} />
        {FIELDS.map(({ name, label, ...rest }) => (
          <label className="flex flex-col gap-1 text-sm" key={name}>
            {label}
            <input
              className="rounded border border-gray-400 px-2 py-1"
              defaultValue={billingAddress?.[name] ?? ''}
              name={name}
              required={'required' in rest}
              type="text"
            />
          </label>
        ))}
        <button
          className="self-start rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
          type="submit"
        >
          Save billing address
        </button>
      </form>
      <Link
        className="text-sm text-blue-600 underline hover:no-underline"
        href="/account/payment-methods"
      >
        Cancel
      </Link>
    </>
  );
}
