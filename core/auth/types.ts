import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'];
  }

  interface User {
    name?: string | null;
    email?: string | null;
    cartId?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: DefaultSession['user'];
  }
}
