// This is a dummy page as a placeholder for payment methods list page that will be implemented later to be the entry point of the "Add payment method" page, and to be the redirect URL after adding a payment method successfully.
// Only for the COP.
import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PaymentMethodsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div>
      <strong>Payment methods (for POC purpose)</strong>
      <br />
      <small>
        This is a dummy page as a placeholder for payment methods list page that will be implemented
        later to be the entry point of the "Add payment method" page, and to be the redirect URL
        after adding a payment method successfully.
      </small>
      <br />
      <br />
      <Link href="/account/payment-methods/add/squarev2.card?init=1">
        Add a card (Square - using provider's widget)
      </Link>
      <br />
      <Link href="/account/payment-methods/add/braintree.card">
        Add a card (Braintree - using BigPay's hosted forms)
      </Link>
    </div>
  );
}
