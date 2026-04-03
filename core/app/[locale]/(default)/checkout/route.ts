import { BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { unstable_rethrow as rethrow } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { getVisitIdCookie, getVisitorIdCookie } from '~/lib/analytics/bigcommerce';
import { getCartId } from '~/lib/cart';
import { getConsentCookie } from '~/lib/consent-manager/cookies/server';
import { serverToast } from '~/lib/server-toast';

const CheckoutRedirectMutation = graphql(`
  mutation CheckoutRedirectMutation(
    $cartId: String!
    $visitId: String!
    $visitorId: String!
    $referer: URL!
    $userAgent: String!
    $analyticsConsent: Boolean!
    $functionalConsent: Boolean!
    $targetingConsent: Boolean!
  ) {
    cart {
      createCartRedirectUrls(
        input: {
          cartEntityId: $cartId
          analytics: {
            initiator: { visitId: $visitId, visitorId: $visitorId }
            request: { url: $referer, userAgent: $userAgent }
            consent: {
              analytics: $analyticsConsent
              functional: $functionalConsent
              targeting: $targetingConsent
            }
          }
        }
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
  const t = await getTranslations('Cart.Errors');

  if (!cartId) {
    await serverToast.error(t('cartNotFound'));

    return redirect({ href: '/cart', locale });
  }

  const visitId = await getVisitIdCookie();
  const visitorId = await getVisitorIdCookie();
  const consent = await getConsentCookie();

  try {
    const { data } = await client.fetch({
      document: CheckoutRedirectMutation,
      variables: {
        cartId,
        visitId: visitId ?? '',
        visitorId: visitorId ?? '',
        analyticsConsent: consent?.preferences.measurement ?? false,
        functionalConsent: consent?.preferences.functionality ?? false,
        targetingConsent: consent?.preferences.marketing ?? false,
        referer: req.headers.get('referer') ?? '',
        userAgent: req.headers.get('user-agent') ?? '',
      },
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
      channelId,
    });

    if (
      data.cart.createCartRedirectUrls.errors.length > 0 ||
      !data.cart.createCartRedirectUrls.redirectUrls
    ) {
      await serverToast.error(t('somethingWentWrong'));

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
