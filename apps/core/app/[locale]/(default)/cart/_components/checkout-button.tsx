import { Button } from '@bigcommerce/components/button';

import { getCheckoutUrl } from '~/client/management/get-checkout-url';

export const CheckoutButton = async ({ cartId, label }: { cartId: string; label: string }) => {
  const checkoutUrl = await getCheckoutUrl(cartId);

  return (
    <Button asChild className="mt-6">
      <a href={checkoutUrl}>{label}</a>
    </Button>
  );
};
