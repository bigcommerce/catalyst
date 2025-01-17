import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getPageSnapshot } from './client';

export async function Page({ path, locale }: { path: string; locale: string }) {
  const snapshot = await getPageSnapshot({ path, locale });

  if (snapshot == null) {
    // This is a temporary solution to fix the issue where non-published pages are not editable in the builder.
    await connection();

    return notFound();
  }

  return <MakeswiftPage snapshot={snapshot} />;
}