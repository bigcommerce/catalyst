import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link as CustomLink } from '~/components/link';
import { cn } from '~//lib/utils';

interface Link {
  href: string;
  label: string;
}

interface Props {
  breadcrumbs: Link[];
  className?: string;
}

const Breadcrumbs = ({ breadcrumbs, className }: Props) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ul className="main-breadcrumbs flex flex-wrap items-center py-4">
        {/* Static Home breadcrumb */}
        <li className="flex items-center text-[16px] font-normal">
          <CustomLink className="font-normal text-[#7F7F7F]" href="/">
            Home
          </CustomLink>
        </li>
        <span className="mx-1 font-normal text-[#7F7F7F]">/</span>

        {/* Dynamic breadcrumbs */}
        {breadcrumbs.map(({ label, href }, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <Fragment key={label}>
              <li className="flex items-center text-[16px] font-normal">
                <CustomLink
                  aria-current={isLast ? `page` : undefined}
                  className={cn(
                    'font-normal text-[#7F7F7F]', // Default color for breadcrumbs
                    isLast && 'font-normal text-[#006380]', // Apply custom color and bold for last breadcrumb
                  )}
                  href={href}
                >
                  {label}
                </CustomLink>
              </li>
              {!isLast ? (
                <span className="mx-1 font-normal text-[#7F7F7F]">
                  /{/* <ChevronRight aria-hidden="true" size={20} /> */}
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export { Breadcrumbs };
