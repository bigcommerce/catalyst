import React from 'react';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import clsx from 'clsx';

import { SelectMenu } from '../SelectMenu';
import { Warning } from '../Warning';

interface Breadcrumb {
  text?: string | null;
  link?: {
    href: string;
    target?: '_self' | '_blank';
  };
}

interface Props {
  className?: string;
  breadcrumbs: Breadcrumb[];
  currentPage?: string | null;
}

export function Breadcrumbs({ className, breadcrumbs, currentPage }: Props) {
  if (breadcrumbs.length === 0 && currentPage?.length === 0)
    return <Warning className={className}>There are no breadcrumbs</Warning>;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ul className={clsx('flex w-full text-sm')}>
        {breadcrumbs?.map((breadcrumb, i) => {
          return (
            <li
              key={i}
              className={clsx(
                'shrink-auto flex min-w-0 items-center font-semibold [&:first-child>svg]:hidden',
              )}
            >
              <ChevronRight size={16} className="mx-1 stroke-current" />

              <span className="flex-1 truncate hover:text-blue-primary">
                {breadcrumb.link ? (
                  <Link href={breadcrumb.link?.href ?? '#'} target={breadcrumb.link?.target}>
                    {breadcrumb.text}
                  </Link>
                ) : (
                  breadcrumb.text
                )}
              </span>
            </li>
          );
        })}
        <li className="flex min-w-0 shrink items-center font-extrabold">
          <ChevronRight size={16} className="mx-1 stroke-current" />
          <span className="truncate">{currentPage}</span>
        </li>
      </ul>
    </nav>
  );
}
