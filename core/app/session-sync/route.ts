// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { redirect, unstable_rethrow as rethrow } from 'next/navigation';

import { signIn } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { setCartId } from '~/lib/cookies/cart';

// GQL mutation for validating Session Sync JWT
const ValidateSessionSyncJwt = graphql(`
  mutation ValidateSessionSyncJwt($jwt: String!) {
    validateSessionSyncJwt(jwt: $jwt) {
      errors {
        ... on InvalidSessionSyncJwtError {
          errorType
          message
        }
        ... on JwtTokenExpiredError {
          message
        }
      }
      content {
        cart {
          entityId
        }
        customer {
          entityId
          firstName
          lastName
          email
        }
        customerAccessToken {
          value
        }
        redirectTo
      }
    }
  }
`);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jwt = searchParams.get('jwt');

  if (!jwt) {
    return redirect('/login?error=MissingToken');
  }

  try {
    // Validate the session sync JWT
    const response = await client.fetch({
      document: ValidateSessionSyncJwt,
      variables: { jwt },
      fetchOptions: { cache: 'no-store' },
    });

    const data = response.data.validateSessionSyncJwt;

    if (data.errors.length) {
      return redirect('/login?error=InvalidToken');
    }

    // Restore cart
    if (data.content?.cart?.entityId) {
      await setCartId(data.content.cart.entityId);
    }

    // Restore the customer session
    // (signIn will re-validate an active session for next-auth)
    if (data.content?.customerAccessToken?.value) {
      await signIn('credentials', {
        type: 'jwt',
        jwt: data.content.customerAccessToken.value,
        redirectTo: data.content.redirectTo,
      });
    }

    // Get relative redirectTo path from full URL
    const redirectTo = new URL(data.content?.redirectTo || '/').pathname;

    // Finally, redirect user to the redirectTo parameter or default page
    redirect(redirectTo);
  } catch (error) {
    rethrow(error);
    redirect('/login?error=InvalidToken');
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
