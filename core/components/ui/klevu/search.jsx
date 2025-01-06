'use client';

import { KlevuSearchLandingPage } from '@klevu/ui-react';
import React from 'react';

import { KlevuInitWrapper } from '~/components/ui/klevu/init';

export default function KlevuSearch({ term }) {
  return (
    <KlevuInitWrapper>
      <KlevuSearchLandingPage term={term} />
    </KlevuInitWrapper>
  );
}
