import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { signIn, signOut } from '~/auth';
import { buildConfig } from '~/build-config/reader';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { clearCartId, setCartId } from '~/lib/cart';

const ChannelSpecificUrlSettingsQuery = graphql(`
  query ChannelSpecificUrlSettingsQuery {
    site {
      settings {
        url {
          channelSpecificCheckoutUrl: checkoutUrl
          channelSpecificVanityUrl: vanityUrl
        }
      }
    }
  }
`);

const VerifySessionSyncJwtMutation = graphql(`
  mutation VerifySessionSyncJwt($jwt: String!) {
    validateSessionSyncJwt(jwt: $jwt) {
      content {
        redirectTo
        customer {
          entityId
          firstName
          lastName
          email
        }
        customerAccessToken {
          value
          expiresAt
        }
        cart {
          entityId
        }
      }
      errors {
        __typename
        ... on InvalidSessionSyncJwtError {
          errorType
          message
        }
        ... on JwtTokenExpiredError {
          message
        }
      }
    }
  }
`);

const VALID_ORIGINS = new Set([
  buildConfig.get('urls').vanityUrl,
  buildConfig.get('urls').checkoutUrl,
  // TODO: Remove before merging PR - TESTING ONLY
  'https://session-sync-example.vercel.app',
]);

async function fetchAndSetChannelSpecificUrlSettings() {
  const {
    data: {
      site: { settings },
    },
  } = await client.fetch({
    document: ChannelSpecificUrlSettingsQuery,
    fetchOptions: { next: { revalidate } },
  });

  if (settings?.url) {
    VALID_ORIGINS.add(settings.url.channelSpecificVanityUrl);
  }

  if (settings?.url.channelSpecificCheckoutUrl) {
    VALID_ORIGINS.add(settings.url.channelSpecificCheckoutUrl);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ jwt: string }> }) {
  const { jwt } = await params;
  const referer = request.headers.get('referer');
  const requestOrigin = referer ? new URL(referer).origin : null;
  const query = request.nextUrl.searchParams;

  if (!requestOrigin || !VALID_ORIGINS.has(requestOrigin)) {
    return NextResponse.json(
      { message: 'Invalid origin' },
      { status: 403, statusText: 'Forbidden' },
    );
  }

  const [, verifySessionSyncJwtResponse] = await Promise.all([
    fetchAndSetChannelSpecificUrlSettings,
    client.fetch({
      document: VerifySessionSyncJwtMutation,
      variables: { jwt },
      fetchOptions: { cache: 'no-store' },
    }),
  ]);

  const { data, errors } = verifySessionSyncJwtResponse;

  if (errors?.length) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500, statusText: 'Server error' },
    );
  }

  const { content, errors: validationErrors } = data.validateSessionSyncJwt;

  // Handle any validation errors or if the content is null
  if (validationErrors.length || content === null) {
    const error = validationErrors.at(0);

    switch (error?.__typename) {
      case 'InvalidSessionSyncJwtError':
        return NextResponse.json(
          { message: 'Invalid Session Sync JWT' },
          { status: 400, statusText: 'Bad request' },
        );

      case 'JwtTokenExpiredError':
        return NextResponse.redirect(request.referrer);

      default:
        return NextResponse.json(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Server error' },
        );
    }
  }

  // Update the cart id if it exists regardless of if the customer is logged in or not
  if (content.cart?.entityId) {
    await setCartId(content.cart.entityId);
  } else {
    await clearCartId();
  }

  if (content.customer && content.customerAccessToken) {
    await signIn('session-sync', {
      name: `${content.customer.firstName} ${content.customer.lastName}`,
      email: content.customer.email,
      customerAccessToken: content.customerAccessToken.value,
      redirect: false,
    });
  } else {
    await signOut({ redirect: false });
  }

  if (query.get('redirect') === 'false') {
    revalidatePath('/', 'layout');

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  const redirectTo = new URL(content.redirectTo);

  if (!VALID_ORIGINS.has(redirectTo.origin)) {
    return NextResponse.json(
      { message: 'Invalid redirectTo origin' },
      { status: 400, statusText: 'Bad request' },
    );
  }

  revalidatePath('/', 'layout');

  return NextResponse.redirect(redirectTo);
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
