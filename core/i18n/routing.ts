export { createRouting } from './locale-routing';
export type { LocaleNode, LocaleRouting } from './locale-routing';

// Server-side `redirect`/`permanentRedirect` live in `~/i18n/navigation-server` and must not be
// re-exported here: this module is in the client graph.
export { Link, usePathname, useRouter } from './navigation-client';
