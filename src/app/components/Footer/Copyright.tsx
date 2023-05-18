import { ComponentPropsWithoutRef } from 'react';

import { bcFetch } from '../../../lib/fetcher';

import { getStoreNameQuery } from './query';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const { data } = await bcFetch({
    query: getStoreNameQuery,
  });

  if (!data.site.settings) {
    return null;
  }

  return (
    <div {...props}>
      <p className="text-sm text-slate-500">
        © {new Date().getFullYear()} {data.site.settings.storeName} – Powered by BigCommerce
      </p>
    </div>
  );
};
