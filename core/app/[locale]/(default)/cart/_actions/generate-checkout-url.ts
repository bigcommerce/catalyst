'use server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';

const CheckoutRedirectMutation = graphql(`
  mutation CheckoutRedirectMutation($cartId: String!, $visitId: UUID, $visitorId: UUID) {
    cart {
      createCartRedirectUrls(
        input: { cartEntityId: $cartId, visitId: $visitId, visitorId: $visitorId }
      ) {
        errors {
          ... on NotFoundError {
            __typename
          }
        }
        redirectUrls {
          redirectedCheckoutUrl
        }
      }
    }
  }
`);

export interface GenerateCheckoutUrlResult {
  url: string | null;
  error?: string;
}

export async function generateCheckoutUrl(
  cartId: string,
  locale: string,
): Promise<GenerateCheckoutUrlResult> {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const channelId = getChannelIdFromLocale(locale);
    const visitId = await getVisitIdCookie();
    const visitorId = await getVisitorIdCookie();

    const { data } = await client.fetch({
      document: CheckoutRedirectMutation,
      variables: { cartId, visitId, visitorId },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
      channelId,
    });

    if (
      data.cart.createCartRedirectUrls.errors.length > 0 ||
      !data.cart.createCartRedirectUrls.redirectUrls
    ) {
      return { url: null, error: 'Failed to generate checkout URL' };
    }

    const url = data.cart.createCartRedirectUrls.redirectUrls.redirectedCheckoutUrl

    // TEST: Hardcoded URL for testing speculation rules
    // let newUrl = new URL(url);
    // newUrl.hostname = 'checkout-proxy-test.catalyst-canary.store';
    
    const testUrl = 'https://checkout.catalyst-canary.store/checkout?products=zz%3A1&order_source=buybutton&action=buy';

    return { url: testUrl };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating checkout URL:', error);

    return { url: null, error: 'Failed to generate checkout URL' };
  }
}
