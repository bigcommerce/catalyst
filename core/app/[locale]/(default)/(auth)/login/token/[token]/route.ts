/*
 * This route is used to accept customer login token JWTs from the
 * [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login)
 * and log the customers in using alternative authentication methods
 */

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { signIn } from '~/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const token = (await params).token;
  const locale = await getLocale();
  
  try {
    console.log('Attempting login with token');
    
    const result = await signIn('credentials', {
      type: 'jwt',
      jwt: token,
      redirect: false,
    });

    console.log('SignIn result:', result);

    if (!result) {
      console.error('No result from signIn');
      redirect(`/${locale}/login?error=NoResponse`);
    }

    if (result.error) {
      console.error('SignIn error:', result.error);
      redirect(`/${locale}/login?error=InvalidToken`);
    }

    // Handle the redirect URL
    if (result.url) {
      // Remove any leading slash and add locale
      const cleanUrl = result.url.replace(/^\/+/, '');
      redirect(`/${locale}/${cleanUrl}`);
    }

    // Default fallback
    redirect(`/${locale}/account`);
  } catch (error) {
    console.error('Login error:', error);
    redirect(`/${locale}/login?error=UnexpectedError`);
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';