'use server';

import { auth, updateSession } from '~/auth';

export async function getCartId(): Promise<string | undefined> {
  const session = await auth();

  return session?.user?.cartId ?? undefined;
}

export async function setCartId(cartId: string): Promise<void> {
  await updateSession({ user: { cartId } });
}

export async function clearCartId(): Promise<void> {
  await updateSession({ user: { cartId: null } });
}
