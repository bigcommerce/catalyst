import { User } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: User;
  }

  interface User {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    cartId?: string | null;
    /**
     * Cart id per channel. `cartId` stays for sessions created before this field existed.
     */
    cartIds?: Record<string, string> | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
  }

  interface AnonymousUser {
    cartId?: string | null;
    /**
     * Cart id per channel. `cartId` stays for sessions created before this field existed.
     */
    cartIds?: Record<string, string> | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: User;
  }
}
