import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default function DefaultLayout({ children }: Props) {
  return <main>{children}</main>;
}
