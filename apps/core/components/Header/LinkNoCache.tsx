'use client';

import { useRouter } from 'next/navigation';
import { ComponentPropsWithoutRef, startTransition } from 'react';

type Props = ComponentPropsWithoutRef<'a'> & {
  href: string;
};

// Workaround for bypassing client cache
export const LinkNoCache = ({ href, children, ...props }: Props) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    startTransition(() => {
      router.push(href);
      router.refresh();
    });
  };

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
};
