'use client';

import { useClearRefinements, UseClearRefinementsProps } from 'react-instantsearch';
import { cn } from '~/lib/utils';

type ClearRefinementsClassNames = {
  root?: string,
  title?: string,
  button?: string
};

type ClearRefinementsProps = UseClearRefinementsProps & {
  title?: string,
  buttonText?: string,
  classNames?: Partial<ClearRefinementsClassNames>;
};

export function ClearRefinements({ includedAttributes, excludedAttributes, transformItems, title, buttonText = 'Clear', classNames, ...props }: ClearRefinementsProps) {
  const { refine, canRefine, createURL } = useClearRefinements(props);

  return canRefine &&
  <>
    { title &&
    <span className={cn(
      'ais-ClearRefinements-title',
      classNames?.title,
    )}>{title}</span>
    }
    <div className={cn(
      'ais-ClearRefinements',
      classNames?.root,
    )}>
      {buttonText &&
        <button type="button" onClick={refine} className={cn(
          'ais-ClearRefinements-button',
          classNames?.button,
        )}>{buttonText}</button>
      }
    </div>
  </>;
}