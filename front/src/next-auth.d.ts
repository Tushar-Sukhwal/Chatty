import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context.
   * This extends the SessiŽon interface to include your custom `token` on the `user` object.
   */
  interface Session {
    user: {
      /** The user's access token. */
      token?: string;
    } & DefaultSession['user']; // Merges with default user properties (name, email, image, etc.)
  }

  /**
   * Optional: Extends the built-in User type.
   * This is the user object you work with in JWT and session callbacks.
   * If your token originates from the User object in these callbacks, type it here too.
   */
  interface User extends DefaultUser {
    token?: string;
  }
}

/**
 * Optional: If you are using JWTs and your token is part of the JWT payload.
 */
declare module 'next-auth/jwt' {
  interface JWT {
    /** User's access token, if you store it here */
    token?: string;
  }
} 