import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { notFound } from 'next/navigation';

import { getPageSnapshot } from './client';

export async function Page({ path, locale }: { path: string; locale: string }) {
  const snapshot = await getPageSnapshot({ path, locale });

  if (snapshot == null) return notFound();

  return <MakeswiftPage snapshot={snapshot} />;
}
