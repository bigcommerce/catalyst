import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Link as CustomLink } from '~/components/link';
import { usePathname } from '~/i18n/routing';
import { cn } from '~/lib/utils';

interface Props {
  className?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor?: string;
}

const Pagination = ({ className, endCursor, hasPreviousPage, hasNextPage, startCursor }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const beforeSearchParams = new URLSearchParams(searchParams);

  beforeSearchParams.delete('after');

  if (startCursor) {
    beforeSearchParams.set('before', String(startCursor));
  }

  const afterSearchParams = new URLSearchParams(searchParams);

  afterSearchParams.delete('before');

  if (endCursor) {
    afterSearchParams.set('after', String(endCursor));
  }

  return (
    <nav aria-label="Pagination" className={cn('my-6 text-center text-primary', className)}>
      {hasPreviousPage ? (
        <CustomLink className="inline-block" href={`${pathname}?${beforeSearchParams.toString()}`}>
          <span className="sr-only">Previous</span>
          <ChevronLeft aria-hidden="true" className="m-2 inline-block h-8 w-8" />
        </CustomLink>
      ) : (
        <ChevronLeft aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
      )}

      {hasNextPage ? (
        <CustomLink className="inline-block" href={`${pathname}?${afterSearchParams.toString()}`}>
          <span className="sr-only">Next</span>
          <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8" />
        </CustomLink>
      ) : (
        <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
      )}
    </nav>
  );
};

export { Pagination };
