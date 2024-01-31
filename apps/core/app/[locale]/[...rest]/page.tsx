import { notFound } from 'next/navigation';
// NOTE: To catch unknown routes too, you can define a catch-all route that explicitly calls the notFound function.
// https://next-intl-docs.vercel.app/docs/environments/error-files#catching-unknown-routes

export default function CatchAllPage() {
  notFound();
}
