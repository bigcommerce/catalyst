'use server';

import { redirect } from 'next/navigation';

import { signOut } from '~/auth';

export const logout = async () => {
  await signOut({ redirect: false });

  redirect('/login');
};
