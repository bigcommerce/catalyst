'use client'

import { useCurrentRefinements, UseCurrentRefinementsProps } from 'react-instantsearch';
import { cn } from '~/lib/utils';

type CurrentRefinementsClassNames = {
  root?: string,
  list?: string,
  item?: string,
  label?: string,
  category?: string,
  categoryLabel?: string,
  delete?: string
};

type CurrentRefinementsProps = UseCurrentRefinementsProps & {
  classNames?: Partial<CurrentRefinementsClassNames>;
};

import attributeLabels from '~/belami/include/attribute-labels.json';

type DynamicObject = {
  [key: string]: string;
};

const labels: DynamicObject = attributeLabels;

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

export function CurrentRefinements({ includedAttributes, excludedAttributes, transformItems, classNames, ...props }: CurrentRefinementsProps) {
  const { items, canRefine, refine, createURL } = useCurrentRefinements(props, {});

  return (items &&
    <div className={cn(
      'ais-CurrentRefinements',
      classNames?.root,
    )}>
      <ul className={cn(
        'ais-CurrentRefinements-list',
        classNames?.list,
      )}>
        {items.map((item: any) => (
          <li key={[item.indexName, item.label].join('/')} className={cn(
            'ais-CurrentRefinements-item',
            classNames?.item,
          )}>
            <span className={cn(
              'ais-CurrentRefinements-label',
              classNames?.label,
            )}>{labels[item.attribute] ?? item.label}:</span>
            {item.refinements.map((refinement: any) => (
              <span key={refinement.label} className={cn(
                'ais-CurrentRefinements-category',
                classNames?.category,
              )}>
                <span className={cn(
                  'ais-CurrentRefinements-categoryLabel',
                  classNames?.categoryLabel,
                )}>{refinement.label}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    if (isModifierClick(event)) {
                      return;
                    }

                    refine(refinement);
                  }}
                  className={cn(
                    'ais-CurrentRefinements-delete',
                    classNames?.delete,
                  )}
                >✕</button>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}