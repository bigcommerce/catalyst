import { NextResponse } from 'next/server';

export async function middleware() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const response = await fetch(`https://${process.env.VERCEL_URL!}/api/time`);
  const time = await response.text();

  // eslint-disable-next-line no-console
  console.log(`The time is ${time}`);

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
