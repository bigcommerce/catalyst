import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import localeToChannelsMappings, { type LocalesKeys } from '~/channels.config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChannelIdFromLocale(locale?: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const channelId = localeToChannelsMappings[locale as LocalesKeys];

  if (channelId) {
    return channelId;
  }

  // Return default if no mapping found
  return process.env.BIGCOMMERCE_CHANNEL_ID;
}
