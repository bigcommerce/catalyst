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

    if (result?.error) {
      // Redirect to login page with error
      redirect('/login?error=InvalidToken');
    }

    // Successful login - redirect to home page
    redirect('/');
  } catch (error) {
    console.error(error);
    // Handle any unexpected errors
    redirect('/login?error=UnexpectedError');
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';