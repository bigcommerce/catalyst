import { getCheckoutUrl } from '~/client/management/get-checkout-url';
import { Button } from '~/components/ui/button';

export const CheckoutButton = async ({ cartId, label }: { cartId: string; label: string }) => {
  const checkoutUrl = await getCheckoutUrl(cartId);

  return (
    <Button asChild className="mt-6">
      <a href={checkoutUrl}>{label}</a>
    </Button>
  );
};
