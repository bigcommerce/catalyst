import clsx from 'clsx';
import { ReactNode } from 'react';

export function Warning({ className, children }: { className?: string; children?: ReactNode }) {
  return <p className={clsx('text py-4 text-center text-gray-600', className)}>{children}</p>;
}
