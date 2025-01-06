'use client';

import { KlevuQuicksearch } from '@klevu/ui-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { KlevuInitWrapper } from '~/components/ui/klevu/init';

export default function KlevuQuickSearch() {
  const { push } = useRouter();

  const handleQuickSearchEvent = (event) => {
    if (event.detail !== '') {
      push(`/search/?term=${event.detail}`);
    }
  };

  const wheelHandler = (event) => {
    event.stopPropagation();

    return false;
  };

  return (
    <div className="col-span-4 flex lg:col-span-3" onWheel={wheelHandler}>
      <KlevuInitWrapper>
        <KlevuQuicksearch
          fallback-term=""
          onKlevuSearch={handleQuickSearchEvent}
          popup-anchor="bottom-start"
          search-categories="true"
          search-cms-cages="true"
        />
      </KlevuInitWrapper>
    </div>
  );
};
