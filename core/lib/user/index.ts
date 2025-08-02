import { auth } from '~/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  cartId: string;
}

export async function getUser(): Promise<User | undefined> {
  const session = await auth();

  if (!session || !session.user) {
    return undefined;
  }

  return {
    id: session.user.id || '',
    name: session.user.name || '',
    email: session.user.email || '',
    cartId: session.user.cartId || '',
  };
}
