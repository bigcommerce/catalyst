import { ComponentPropsWithoutRef } from 'react';

import { getStoreSettings } from '@client';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const { storeName } = await getStoreSettings();

  return (
    <div {...props}>
      <p className="text-sm text-slate-500">
        © {new Date().getFullYear()} {storeName} – Powered by BigCommerce
      </p>
    </div>
  );
};
