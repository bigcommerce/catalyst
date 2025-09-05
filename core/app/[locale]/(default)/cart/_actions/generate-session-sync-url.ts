'use server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getCartId } from '~/lib/cart';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';

const GenerateSessionSyncJwtMutation = graphql(`
  mutation GenerateSessionSyncJwtMutation(
    $redirectTo: String!
    $cartId: String
    $visitorId: UUID
    $visitId: UUID
  ) {
    generateSessionSyncJwt(
      redirectTo: $redirectTo
      cartId: $cartId
      visitorId: $visitorId
      visitId: $visitId
    ) {
      result {
        token
        url
      }
      errors {
        ... on GenerateSessionSyncTokenCartNotFound {
          __typename
          message
        }
      }
    }
  }
`);

export async function generateSessionSyncUrl(redirectPath: string, locale: string): Promise<string | null> {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const cartId = await getCartId();
    const channelId = getChannelIdFromLocale(locale);
    const visitId = await getVisitIdCookie();
    const visitorId = await getVisitorIdCookie();

    const { data } = await client.fetch({
      document: GenerateSessionSyncJwtMutation,
      variables: {
        redirectTo: '/account.php',
        cartId,
        visitorId,
        visitId,
      },
      customerAccessToken,
      channelId,
      fetchOptions: { cache: 'no-store' },
    });

    if (data.generateSessionSyncJwt.errors.length > 0 || !data.generateSessionSyncJwt.result) {
      console.error('Error generating session sync JWT:', data.generateSessionSyncJwt.errors);
      return null;
    }

    // Return the session sync URL from the GraphQL response
    return data.generateSessionSyncJwt.result.url;
  } catch (error) {
    console.error('Error generating session sync URL:', error);
    return null;
  }
}
