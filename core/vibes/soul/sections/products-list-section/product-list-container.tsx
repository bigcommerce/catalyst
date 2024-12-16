'use client';

import { clsx } from 'clsx';
import { use } from 'react';

import { ProductListTransitionContext } from './context';

export function ProductListContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isPending] = use(ProductListTransitionContext);

  return <div className={clsx(isPending && 'opacity-50', className)}>{children}</div>;
}
