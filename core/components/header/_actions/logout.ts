'use server';

import { signOut } from '~/auth';
import { redirect } from '~/i18n/routing';

export const logout = async () => {
  await signOut({ redirect: false });

  redirect('/login');
};
