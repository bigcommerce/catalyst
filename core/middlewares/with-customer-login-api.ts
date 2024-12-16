import { NextResponse } from 'next/server';

import { signIn } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

const LOGIN_TOKEN_PATH_REGEX = /^\/login\/token\/([^/]+)$/;

export const withCustomerLoginAPI: MiddlewareFactory = () => {
  return async (request) => {
    const pathname = request.nextUrl.pathname;
    const match = pathname.match(LOGIN_TOKEN_PATH_REGEX);

    console.log('Match:', match);

    if (!match) {
      return NextResponse.next();
    }

    const token = match[1];

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
        return NextResponse.redirect(new URL('/en/login?error=NoResponse', request.url));
      }

      if (result.error) {
        console.error('SignIn error:', result.error);
        return NextResponse.redirect(new URL('/en/login?error=InvalidToken', request.url));
      }

      // Handle the redirect URL
      if (result.url) {
        // Add default locale to the redirect URL
        return NextResponse.redirect(new URL(`/${result.url}`, request.url));
      }

      // Default fallback
      return NextResponse.redirect(new URL('/account', request.url));
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.redirect(new URL('/en/login?error=UnexpectedError', request.url));
    }
  };
}; 