import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import localeToChannelsMappings, { type LocalesKeys } from '~/channels.config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChannelIdFromLocale(locale?: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return localeToChannelsMappings[locale as LocalesKeys];
}
