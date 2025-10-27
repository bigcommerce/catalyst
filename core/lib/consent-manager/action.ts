'use server';

import { revalidateTag } from 'next/cache';

import { setConsentCookie } from './cookies/server';
import { ConsentStateSchema } from './schema';

export const setConsentAction = async (preferences: Record<string, boolean>) => {
  const validatedPreferences = ConsentStateSchema.parse(preferences);

  await setConsentCookie({
    preferences: validatedPreferences,
    timestamp: new Date().toISOString(),
  });

  revalidateTag('scripts');

  return { success: true };
};
