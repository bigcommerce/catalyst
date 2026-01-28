import { notFound } from 'next/navigation';

// For scenarios where a redirect to `notFound` is used outside the `[locale]` path.
// We still need to redirect to the `[locale]/not-found` path so that the page is rendered with the correct locale.
export default function Page() {
  // redirect({ href: '/not-found', locale: defaultLocale });
  notFound();
}
