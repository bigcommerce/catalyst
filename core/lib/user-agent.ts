'use server';

import { headers } from 'next/headers';
import { userAgent } from 'next/server';

async function getUserAgent() {
  return userAgent({ headers: await headers() });
}

export async function isMobileUser() {
  const { device } = await getUserAgent();

  if (!device.type) {
    return false;
  }

  return ['mobile', 'tablet'].includes(device.type);
}
