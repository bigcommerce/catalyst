import { PropsWithChildren } from 'react';

import { auth } from '~/auth';
import { redirect } from '~/i18n/routing';

export default async function AccountLayout({ children }: PropsWithChildren) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return children;
}
