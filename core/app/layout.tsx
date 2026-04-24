import { PropsWithChildren } from 'react';

// Since we have a `not-found.tsx` at the root, a layout file is required even if
// it just passes children through. Ownership of <html>/<body> lives in
// app/[locale]/layout.tsx (to set lang={locale}) and app/not-found.tsx (for
// non-localized 404s). See: https://next-intl.dev/docs/environments/error-files
// TODO: Move <html>/<body> back here and set lang via Next.js `rootParams`
// once it is available on Native Hosting (Next.js 16.2+).
export default function RootLayout({ children }: PropsWithChildren) {
  return children;
}
