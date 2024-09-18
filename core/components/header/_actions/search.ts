'use server';

import { z } from 'zod';

import { redirect } from '~/i18n/routing';

// eslint-disable-next-line @typescript-eslint/require-await
export const search = async (formData: FormData) => {
  const searchTerm = z.string().parse(formData.get('searchTerm'));

  if (searchTerm) {
    redirect(`/search?term=${searchTerm}`);
  }
};
