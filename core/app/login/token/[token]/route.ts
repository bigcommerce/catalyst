/*
 * This route is used to accept customer login token JWTs from the
 * [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login)
 * and log the customers in using alternative authentication methods
 */

import { decodeJwt } from 'jose';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { redirect, unstable_rethrow as rethrow } from 'next/navigation';

import { signIn } from '~/auth';

interface TokenParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: TokenParams) {
  const token = (await params).token;

  try {
    // decode token without checking signature to get redirect path
    // token is not checked for validity here, so it could be expired or invalid at this point
    // token validity and signature are checked in the signIn function
    const claims = decodeJwt(token);
    const redirectTo =
      typeof claims.redirect_to === 'string' ? claims.redirect_to : '/account/orders';

    // sign in with token which will check validity against BigCommerce API
    // and redirect to redirectTo
    await signIn('credentials', {
      type: 'jwt',
      jwt: token,
      redirectTo,
    });
  } catch (error) {
    rethrow(error);

    redirect(`/login?error=InvalidToken`);
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
