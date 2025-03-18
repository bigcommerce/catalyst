import { NextRequest, NextResponse } from 'next/server';

import { signIn, signOut } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { clearCartId, setCartId } from '~/lib/cart';

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

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ jwt: string }> },
) => {
  const { jwt } = await params;

  const { data, errors } = await client.fetch({
    document: VerifySessionSyncJwtMutation,
    variables: { jwt },
    fetchOptions: { cache: 'no-store' },
  });

  // Handle any API Errors
  if (errors?.length) {
    return new NextResponse('', { status: 500, statusText: 'Server error' });
  }

  const { content, errors: validationErrors } = data.validateSessionSyncJwt;

  // Handle any validation errors or if the content is null
  if (validationErrors.length || content === null) {
    const error = validationErrors.at(0);

    switch (error?.__typename) {
      case 'InvalidSessionSyncJwtError':
        return new NextResponse(null, { status: 400, statusText: 'Bad request' });

      case 'JwtTokenExpiredError':
        return NextResponse.redirect(request.referrer);

      default:
        return new NextResponse(null, { status: 500, statusText: 'Server error' });
    }
  }

  // Update the cart id if it exists regardless of if the customer is logged in or not
  if (content.cart?.entityId) {
    await setCartId(content.cart.entityId);
  } else {
    await clearCartId();
  }

  // Soon there will always be a session, whether guest or logged in.
  // We will need to remove this check once that work is complete. We can just
  // update the session in that case.
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

  // Note: redirectTo is going to include the full url, not a partial path
  return NextResponse.redirect(content.redirectTo);
};

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
