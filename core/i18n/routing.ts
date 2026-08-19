export { createRouting } from './locale-routing';
export type { LocaleNode, LocaleRouting } from './locale-routing';

// Lightweight wrappers around Next.js' navigation APIs that consider the merchant's runtime locale
// routing. Server-side `redirect`/`permanentRedirect` live in `~/i18n/navigation-server`, which
// must not be re-exported here — it pulls in the GraphQL client and KV.
export { Link, usePathname, useRouter } from './navigation-client';
