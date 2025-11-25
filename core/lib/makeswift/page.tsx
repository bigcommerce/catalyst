import { notFound } from 'next/navigation';

import { getPageSnapshot } from './client';
import { MakeswiftPageShim } from './makeswift-page-shim';

export async function Page({ path, locale }: { path: string; locale: string }) {
  const snapshot = await getPageSnapshot({ path, locale });

  if (snapshot == null) {
    return notFound();
  }

  return <MakeswiftPageShim snapshot={snapshot} />;
}
