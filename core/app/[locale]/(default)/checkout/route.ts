import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { unstable_rethrow as rethrow } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';
import { getCartId } from '~/lib/cart';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cartId = req.nextUrl.searchParams.get('cartId') ?? (await getCartId());
  const customerAccessToken = await getSessionCustomerAccessToken();
  const channelId = getChannelIdFromLocale(locale);
  console.log("CARTID")
  console.log(cartId)
  if (!cartId) {
    return redirect({ href: '/cart', locale });
  }

  const visitId = await getVisitIdCookie();
  const visitorId = await getVisitorIdCookie();

  try {
    const { data } = await client.fetch({
      document: CheckoutRedirectMutation,
      variables: { cartId, visitId, visitorId },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
      channelId,
    });

    console.log(data)

    if (
      data.cart.createCartRedirectUrls.errors.length > 0 ||
      !data.cart.createCartRedirectUrls.redirectUrls
    ) {
      return redirect({ href: '/cart', locale });
    }

    return redirect({
      href: data.cart.createCartRedirectUrls.redirectUrls.redirectedCheckoutUrl,
      locale,
    });
  } catch (error) {
    rethrow(error);

    if (error instanceof BigCommerceAuthError) {
      return redirect({ href: '/logout?redirectTo=/checkout/', locale });
    }

    // eslint-disable-next-line no-console
    console.error(error);

    return NextResponse.json(
      { message: 'Server error' },
      { status: 500, statusText: 'Server error' },
    );
  }
}
