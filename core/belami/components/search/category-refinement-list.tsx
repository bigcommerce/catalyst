import React from 'react';
import { useRefinementList, UseRefinementListProps } from 'react-instantsearch';
import { cn } from '~/lib/utils';

export function CategoryRefinementList(props: UseRefinementListProps) {
  const {
    items,
    refine
  } = useRefinementList(props);

  return items && items.length > 0 ? (
    <div className={cn('ais-RefinementList', 'category-refinement-list')}>
      <ul className={cn('ais-RefinementList-list')}>
        {items.map((item: any) => (
          <li key={item.label} className={cn('ais-RefinementList-item', item.isRefined && 'ais-RefinementList-item--selected')}>
            <label className={cn('ais-RefinementList-label')}>
              <input className={cn('ais-RefinementList-checkbox')} type="checkbox" checked={item.isRefined} value={item.value} onChange={() => refine(item.value)} />
              <span className={cn('ais-RefinementList-labelText')}>{item.label.split(' > ').pop()}</span>
              <span className={cn('ais-RefinementList-count')}>{item.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
}