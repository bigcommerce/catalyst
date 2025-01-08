'use client'

import Link, { LinkProps } from 'next/link';
import React, { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
>;
type ScrollLinkProps = AnchorProps & LinkProps & PropsWithChildren;

export function ScrollLink({ children, ...props }: ScrollLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getHash = () =>
    typeof window !== 'undefined'
      ? decodeURIComponent(window.location.hash)
      : '';

  useEffect(() => {
    //const onHashChange = () => {
      const targetId = getHash();
      const elem = document.getElementById(targetId);
      window.scrollTo({
        top: elem?.getBoundingClientRect().top,
        behavior: 'smooth',
      });
    //};
    //window.addEventListener('hashchange', onHashChange);
    //return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname, searchParams]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    router.push(e.currentTarget.href, {scroll: false});
/*
    const targetId = e.currentTarget.href.replace(/.*\#/, '');
    const elem = document.getElementById(targetId);
    window.scrollTo({
      top: elem?.getBoundingClientRect().top,
      behavior: "smooth",
    });
*/
  };

  return (
    <Link {...props} onClick={handleScroll}>
      {children}
    </Link>
  );
}