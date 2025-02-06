'use client';

import { useStats, UseStatsProps } from 'react-instantsearch';
import { cn } from '~/lib/utils';

type StatsClassNames = {
  root?: string,
  text?: string
};

export function Stats({ classNames, ...props }: UseStatsProps & {
  classNames?: Partial<StatsClassNames>;
}) {
  const {
    hitsPerPage,
    nbHits,
    areHitsSorted,
    nbSortedHits,
    nbPages,
    page,
    processingTimeMS,
    query,
  } = useStats();

  return <div className={cn('ais-Stats', classNames?.root)}>
    <span className={cn('ais-Stats-text', classNames?.text)}>
      {/* {nbHits.toLocaleString()} results found in {processingTimeMS.toLocaleString()}ms for <q>{query}</q>. */}
      {nbHits.toLocaleString()} results found
    </span>
  </div>;
}