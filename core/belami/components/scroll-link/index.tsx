'use client'

import Link, { LinkProps } from 'next/link';
import React, { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
>;
type ScrollLinkProps = AnchorProps & LinkProps & PropsWithChildren;

export function ScrollLink({ children, ...props }: ScrollLinkProps) {
  const router = useRouter();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    router.push(e.currentTarget.href, {scroll: false});

    const targetId = e.currentTarget.href.replace(/.*\#/, '');
    const elem = document.getElementById(targetId);
    window.scrollTo({
      top: elem?.getBoundingClientRect().top,
      behavior: "smooth",
    });
  };
  return (
    <Link {...props} onClick={handleScroll}>
      {children}
    </Link>
  );
}