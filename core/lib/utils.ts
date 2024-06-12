import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type LocaleToChannelsMapping = Record<string, string | undefined>;

import localeToChannelsMapping from '~/channels.config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChannelFromLocale(locale: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (localeToChannelsMapping as LocaleToChannelsMapping)[locale];
}
