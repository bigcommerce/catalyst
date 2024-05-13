import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { Button } from '~/components/ui/button';

export const CheckoutButtonMutation = graphql(`
  mutation CheckoutButtonMutation($cartId: String!) {
    cart {
      createCartRedirectUrls(input: { cartEntityId: $cartId }) {
        redirectUrls {
          redirectedCheckoutUrl
        }
      }
    }
  }
`);

export const CheckoutButton = async ({ cartId, label }: { cartId: string; label: string }) => {
  const { data } = await client.fetch({
    document: CheckoutButtonMutation,
    variables: { cartId },
    fetchOptions: { cache: 'no-store' },
  });

  const checkoutUrl = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;

  return (
    <Button asChild className="mt-6">
      <a href={checkoutUrl}>{label}</a>
    </Button>
  );
};
