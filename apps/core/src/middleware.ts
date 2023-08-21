import { NextResponse } from 'next/server';

export async function middleware() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const response = await fetch(`https://${process.env.VERCEL_URL!}/api/time`);

  const text = await response.text();

  console.log(text);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/',
  ],
};
