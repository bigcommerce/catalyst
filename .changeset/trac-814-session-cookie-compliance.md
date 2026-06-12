---
"@bigcommerce/catalyst-core": patch
---

Make `authjs.session-token` and `authjs.anonymous-session-token` browser-session cookies (no `Expires` attribute) to satisfy Essential cookie classification requirements.

## What changed

**Anonymous session token:** `anonymousSignIn` no longer sets `maxAge` on the cookie. Without it, Next.js omits `Max-Age`/`Expires` and the cookie becomes a session cookie that the browser drops when it closes.

**Auth session token:** Auth.js v5 unconditionally writes `Expires` on the session token cookie and provides no config option to suppress it. Two post-processing steps strip the attribute:

- `proxies/with-auth.ts` — strips `Expires` from `Set-Cookie` response headers on every page request.
- `auth/index.ts` — wraps `signIn` and `updateSession` to re-set the cookie via `cookies().set()` without `Expires` immediately after Auth.js writes it, covering the sign-in and session-update paths that middleware cannot reach.

`Max-Age=0` (used by Auth.js for cookie deletion on sign-out) is intentionally left intact.

## Migration

**If you have a custom `maxAge` on `anonymousSignIn`:** The default 7-day `maxAge` has been removed. If your app relies on anonymous sessions persisting across browser restarts, add it back in your own `anonymousSignIn` call:

```ts
cookieJar.set(anonymousCookieName, jwt, {
  httpOnly: true,
  sameSite: 'lax',
  secure: useSecureCookies,
  maxAge: 60 * 60 * 24 * 7, // restore 7-day persistence if needed
});
```

**If you already have your own `Expires`-stripping workaround:** Remove it. The middleware regex in `with-auth.ts` and the `patchSessionTokenCookies` wrapper in `auth/index.ts` now handle this centrally. Leaving both in place will cause redundant cookie writes.

**If you import `signIn` or `updateSession` directly from `auth/index.ts`:** No change needed — the signatures are identical. The exports are now thin async wrappers that call the Auth.js originals and then patch any session token cookies written during the call.
