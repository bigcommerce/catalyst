import { getLocale } from 'next-intl/server';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';
import { redirect as externalRedirect } from 'next/navigation'


const CheckoutRedirectMutation = graphql(`
    mutation CheckoutRedirectMutation($cartId: String!) {
      cart {
        createCartRedirectUrls(input: { cartEntityId: $cartId }) {
          redirectUrls {
            redirectedCheckoutUrl
          }
        }
      }
    }
  `);

export async function GET(request: Request) {
    const cartId = await getCartId();
    const locale = await getLocale();
    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!cartId) {
        return redirect({ href: '/cart', locale });
    }

    const { data } = await client.fetch({
        document: CheckoutRedirectMutation,
        variables: { cartId },
        fetchOptions: { cache: 'no-store' },
        customerAccessToken,
      });
  
      const url = data.cart.createCartRedirectUrls.redirectUrls?.redirectedCheckoutUrl;

      if (!url) {
        return redirect({ href: '/cart', locale });
      }

      return externalRedirect(url);
}
