import { cookies } from 'next/headers';

const VISITOR_COOKIE_NAME = 'catalyst.visitorId';
const VISIT_COOKIE_NAME = 'catalyst.visitId';
const VISITOR_DURATION = 400 * 24 * 60 * 60; // 400 days
const VISIT_DURATION = 30 * 60; // 30 minutes

export async function getVisitorIdCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(VISITOR_COOKIE_NAME)?.value;
}

export async function setVisitorIdCookie(visitorId: string): Promise<void> {
  const cookieStore = await cookies();

  // Set client-accessible cookie (not HTTP-only) since visitor ID is not sensitive
  // This allows both server-side and client-side access to the visitor ID
  cookieStore.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: VISITOR_DURATION,
    sameSite: 'lax',
  });
}

export async function getVisitIdCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(VISIT_COOKIE_NAME)?.value;
}

export async function setVisitIdCookie(visitId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(VISIT_COOKIE_NAME, visitId, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: VISIT_DURATION,
  });
}
