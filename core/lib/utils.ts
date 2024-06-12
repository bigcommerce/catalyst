import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type localeToChannelsMappings = Record<string, string | undefined>;

import localeToChannelsMappings from '~/channels.config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChannelFromLocale(locale: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (localeToChannelsMappings as localeToChannelsMappings)[locale];
}
