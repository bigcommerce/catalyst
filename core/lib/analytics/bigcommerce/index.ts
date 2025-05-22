import { cookies } from 'next/headers';
import { validate as isUuid, v4 as uuidv4 } from 'uuid';

const VISITOR_COOKIE_NAME = 'catalyst.visitorId';
const VISIT_COOKIE_NAME = 'catalyst.visitId';
const VISITOR_DURATION = 400 * 24 * 60 * 60; // 400 days
const VISIT_DURATION = 30 * 60; // 30 minutes

interface VisitId {
  id: string;
  isNew: boolean;
}

/**
 * Sets the visitorId cookie. If the cookie does not exist or is invalid, a new one is created.
 * @returns {string} The visitorId
 */
export async function setVisitorIdCookie(): Promise<string> {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

  if (!visitorId || !isUuid(visitorId)) {
    visitorId = uuidv4();
    cookieStore.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: VISITOR_DURATION,
    });
  }

  return visitorId;
}

/**
 * Sets the visitId cookie. If the cookie does not exist or is invalid, a new one is created.
 * @returns {VisitId} An object containing the visitId and a boolean indicating if it's a new visit
 */
export async function setVisitIdCookie(): Promise<VisitId> {
  const cookieStore = await cookies();
  let visitId = cookieStore.get(VISIT_COOKIE_NAME)?.value;
  let isNew = false;

  if (!visitId || !isUuid(visitId)) {
    visitId = uuidv4();
    isNew = true;
    cookieStore.set(VISIT_COOKIE_NAME, visitId, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: VISIT_DURATION,
    });
  }

  return {
    id: visitId,
    isNew,
  };
}

export async function getVisitorId(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(VISITOR_COOKIE_NAME)?.value;
}

export async function getVisitId(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(VISIT_COOKIE_NAME)?.value;
}
