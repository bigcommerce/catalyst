import { User } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: User;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    cartId?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
  }

  interface AnonymousUser {
    cartId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: User;
  }
}
