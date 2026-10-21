import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

import { deleteStoredPaymentInstrument } from './_actions/delete-stored-payment-instrument';
import { getPaymentMethodsPageData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Payment methods',
};

export default async function PaymentMethods({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { paymentMethods, storedInstruments } = await getPaymentMethodsPageData();

  return (
    <>
      <h1 className="mb-4 text-4xl font-medium">Payment methods</h1>
      {paymentMethods.map(
        ({
          id,
          name,
          isAddSupported,
          isDeleteSupported,
          isEditSupported,
          isInitializationRequired,
        }) => {
          const stored = storedInstruments.filter(({ paymentMethodId }) => paymentMethodId === id);

          return (
            <section className="mb-6" key={id}>
              <h2 className="mb-1 text-xl font-medium">{name}</h2>
              {isAddSupported && (
                <Link
                  className="text-sm text-blue-600 underline hover:no-underline"
                  href={`/account/payment-methods/add/${id}${isInitializationRequired ? '?init=1' : ''}`}
                >
                  {`Add new ${name} payment method`}
                </Link>
              )}
              {stored.length === 0 ? (
                <p>No stored payment methods</p>
              ) : (
                <ul>
                  {stored.map(({ token, details }) => (
                    <li className="mb-2 flex items-center gap-2" key={token}>
                      {details.__typename === 'StoredCard'
                        ? `•••• ${details.last4} — ${details.billingAddress?.firstName} ${details.billingAddress?.lastName}`
                        : token}
                      {/* Update button is displayed if editing is supported while Edit functionality is not implemented yet.
                          `updateStoredPaymentInstrument` GQL mutation is available for updating stored payment instruments */}
                      {isEditSupported && (
                        <Link
                          className="rounded border border-blue-600 px-2 py-0.5 text-sm text-blue-600 hover:bg-blue-50"
                          href={`/account/payment-methods/edit/${encodeURIComponent(token)}`}
                        >
                          Update
                        </Link>
                      )}
                      {isDeleteSupported && (
                        <form action={deleteStoredPaymentInstrument}>
                          <input name="token" type="hidden" value={token} />
                          <button
                            className="rounded border border-red-600 px-2 py-0.5 text-sm text-red-600 hover:bg-red-50"
                            type="submit"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        },
      )}
    </>
  );
}
