import { NextResponse } from 'next/server';

import { signIn } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

const LOGIN_TOKEN_PATH_REGEX = /^\/login\/token\/([^/]+)$/;

export const withCustomerLoginAPI: MiddlewareFactory = () => {
  return async (request) => {
    const pathname = request.nextUrl.pathname;

    const match = pathname.match(LOGIN_TOKEN_PATH_REGEX);
    
    if (!match) {
      console.error('No token found when handling customer login API');
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
    }

    const token = match[1];

    try {
      const result = await signIn('credentials', {
        type: 'jwt',
        jwt: token,
        redirect: false,
      });

      if (!result || result.error) {
        console.error('SignIn error when handling customer login API:', result.error);
        return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
      }

      // Handle the redirect URL
      if (result.url && ! result.url.includes('/account.php')) {
        return NextResponse.redirect(new URL(`/${result.url}`, request.url));
      }

      // Default fallback
      return NextResponse.redirect(new URL('/account/orders', request.url));
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.redirect(new URL('/login?error=UnexpectedError', request.url));
    }
  };
};
