import { cookies } from 'next/headers';
import { z } from 'zod';
import 'server-only';

const serverToastSchema = z.object({
  id: z.number(),
  message: z.string(),
  description: z.string().optional(),
  variant: z.enum(['success', 'error', 'warning', 'info']),
  position: z
    .enum(['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'])
    .optional(),
});

export type ServerToastData = z.infer<typeof serverToastSchema>;

type ServerToastOptions = Pick<ServerToastData, 'position' | 'description'>;

const TOAST_COOKIE = 'toast-notification';

function encode(data: ServerToastData): string {
  return btoa(JSON.stringify(data));
}

function decode(data: string): ServerToastData {
  return serverToastSchema.parse(JSON.parse(atob(data)));
}

async function setToastCookie(data: ServerToastData) {
  const cookieStore = await cookies();

  cookieStore.set(TOAST_COOKIE, encode(data), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    partitioned: true,
    maxAge: 0,
  });
}

/**
 * Server-side toast message propagator.
 * Allows queuing a toast message from a server action which will be displayed when the next route renders.
 * Only allows data serializable as JSON.
 */
export const serverToast = {
  success: async (message: string, options?: ServerToastOptions) => {
    await setToastCookie({ id: Date.now(), message, variant: 'success', ...options });
  },
  error: async (message: string, options?: ServerToastOptions) => {
    await setToastCookie({ id: Date.now(), message, variant: 'error', ...options });
  },
  warning: async (message: string, options?: ServerToastOptions) => {
    await setToastCookie({ id: Date.now(), message, variant: 'warning', ...options });
  },
  info: async (message: string, options?: ServerToastOptions) => {
    await setToastCookie({ id: Date.now(), message, variant: 'info', ...options });
  },
};

export const getToastNotification = async (): Promise<ServerToastData | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOAST_COOKIE);

  if (!cookie) {
    return null;
  }

  try {
    return decode(cookie.value);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to decode toast notification cookie', err);

    return null;
  }
};
