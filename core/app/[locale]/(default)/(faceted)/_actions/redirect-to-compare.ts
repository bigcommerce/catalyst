'use server';

import { getLocale } from 'next-intl/server';

import { redirect } from '~/i18n/routing';

export const redirectToCompare = async (formData: FormData) => {
  const locale = await getLocale();

  const compare = formData.getAll('compare');

  redirect({ href: { pathname: '/compare', query: { ids: compare.join(',') } }, locale });
};
