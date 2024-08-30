'use client';

import { lazy } from 'react';

export const metadata = {
  title: 'Error',
};

export default lazy(() => import('./_components/error'));
