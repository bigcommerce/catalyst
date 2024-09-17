/* eslint-disable check-file/folder-naming-convention */
import { notFound } from 'next/navigation';
import { NextRequest } from 'next/server';

import { signIn } from '../../../../../auth';

export const GET = async (request: NextRequest) => {
  const action = request.nextUrl.searchParams.get('action');
  const token = request.nextUrl.searchParams.get('token');
  const redirectUrl = request.nextUrl.searchParams.get('redirectUrl') ?? undefined;

  if (action === 'check_passwordless_login' && token && redirectUrl) {
    await signIn('jwt', { token, redirectTo: redirectUrl });
  }

  return notFound();
};
