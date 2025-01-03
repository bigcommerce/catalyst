import { 
  usePagination, UsePaginationProps
} from 'react-instantsearch';

import { cn } from '~/lib/utils';

export function Pagination({ classNames, ...props }: UsePaginationProps) {

  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL
  } = usePagination(props);

  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  function fixCreateURL(page: number) {
    const url = createURL(page);
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search + urlObj.hash;
  }

  return (
    <div className={cn('ais-Pagination', classNames?.root)}>
    <ul className={cn('ais-Pagination-list', classNames?.list)}>
      <PaginationItem
        isDisabled={isFirstPage}
        href={fixCreateURL(previousPageIndex)}
        onClick={() => refine(previousPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--previousPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Previous Page"
      ><span>‹</span></PaginationItem>
      {/*
      <PaginationItem
        isDisabled={isFirstPage}
        href={fixCreateURL(firstPageIndex)}
        onClick={() => refine(firstPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--firstPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="First Page"
      ><span>‹‹</span></PaginationItem>
      */}
      {nbPages > 5 && currentRefinement + 1 > 3 && <PaginationItem
        isDisabled={isFirstPage}
        href={fixCreateURL(firstPageIndex)}
        onClick={() => refine(firstPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--firstPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="First Page"
      ><span>1</span></PaginationItem>}
      {nbPages > 5 && currentRefinement + 1 > 3 && <li key="dots-1" className={cn('ais-Pagination-item', classNames?.item)}><span className={classNames?.link}>…</span></li>}

      {pages.map((page: number) => {
        const label = page + 1;
        
        return (
          <PaginationItem
            key={page}
            isDisabled={false}
            //aria-label={`Page ${label}`}
            href={fixCreateURL(page)}
            onClick={() => refine(page)}
            classNames={{
              item: cn(page == currentRefinement ? 'ais-Pagination-item--selected' : '', classNames?.item),
              link: classNames?.link,
            }}
            ariaLabel={`Page ${label}`}
          >
            {label}
          </PaginationItem>
        );
      })}
      {nbPages > 5 && currentRefinement + 1 < nbPages - 3 && <li key="dots-2" className={cn('ais-Pagination-item', classNames?.item)}><span className={classNames?.link}>…</span></li>}
      {nbPages > 5 && currentRefinement + 1 < nbPages - 3 && <PaginationItem
        isDisabled={isLastPage}
        href={fixCreateURL(lastPageIndex)}
        onClick={() => refine(lastPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--lastPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Last Page"
      ><span>{lastPageIndex + 1}</span></PaginationItem>
      }
      {/*
      <PaginationItem
        isDisabled={isLastPage}
        href={fixCreateURL(lastPageIndex)}
        onClick={() => refine(lastPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--lastPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Last Page"
      ><span>››</span></PaginationItem>
      */}
      <PaginationItem
        isDisabled={isLastPage}
        href={fixCreateURL(nextPageIndex)}
        onClick={() => refine(nextPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--nextPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Next Page"
      ><span>›</span></PaginationItem>
    </ul>
    </div>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
  onClick: NonNullable<React.ComponentProps<'a'>['onClick']>,
  isDisabled: boolean,
  ariaLabel?: string,
  classNames?: {
    item?: string,
    link?: string
  }
};

function PaginationItem({
  isDisabled,
  href,
  onClick,
  ariaLabel,
  classNames,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return (
      <li className={cn('ais-Pagination-item ais-Pagination-item--disabled', classNames?.item)}>
        <span className={cn('ais-Pagination-link', classNames?.link)} {...props} aria-label={ariaLabel} />
      </li>
    );
  }

  return (
    <li className={cn('ais-Pagination-item', classNames?.item)}>
      <a
        href={href}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }

          event.preventDefault();

          onClick(event);
        }}
        className={cn('ais-Pagination-link', classNames?.link)}
        aria-label={ariaLabel}
        {...props}
      />
    </li>
  );
}

function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}

