import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { auth } from '~/auth';

export default async function AccountLayout({ children }: PropsWithChildren) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return children;
}
