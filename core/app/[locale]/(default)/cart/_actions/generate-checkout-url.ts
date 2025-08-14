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

    return { url: data.cart.createCartRedirectUrls.redirectUrls.redirectedCheckoutUrl };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating checkout URL:', error);

    return { url: null, error: 'Failed to generate checkout URL' };
  }
}
