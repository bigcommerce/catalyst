'use server';

import { redirect } from '~/i18n/routing';

// eslint-disable-next-line @typescript-eslint/require-await
export const changeLocale = async (newLocale: string) => {
  redirect(`/${newLocale}`);
};
