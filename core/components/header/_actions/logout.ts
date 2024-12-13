'use server';

import { getLocale } from 'next-intl/server';

import { auth, signOut } from '~/auth';
import { client } from '~/client';
import { redirect } from '~/i18n/routing';

export const logout = async () => {
  const locale = await getLocale();
  const session = await auth()
  const payload = {
    id: session?.b2bToken,
    name: session?.user?.name,
    email: session?.user?.email,
  }

  await client.b2bFetch(
    '/api/io/auth/backend',
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  await signOut({ redirect: false });

  redirect({ href: '/login', locale });
};
