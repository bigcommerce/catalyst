/*
 * This route is used to accept customer login token JWTs from the
 * [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login)
 * and log the customers in using alternative authentication methods
 */

import { redirect } from 'next/navigation';
import { signIn } from '~/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const token = (await params).token;
  
  try {    
    const result = await signIn('credentials', {
      type: 'jwt',
      jwt: token,
      redirect: false,
    });

    if (!result.success) {
      console.error('SignIn error:', result.error);
      redirect(`/login?error=InvalidToken`);
    }

    // Handle the redirect URL
    if (
      result.url &&
      !result.url.includes('/account.php') // ignore legacy default redirect
    ) {
      const fullUrl = new URL(result.url);
      redirect(fullUrl.pathname); // perform relative redirect regardless of hostname in the redirect URL
    }

    // Default fallback
    redirect(`/account/orders`);
  } catch (error) {
    console.error('Login error:', error);
    redirect(`/login?error=UnexpectedError`);
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
