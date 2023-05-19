import { ComponentPropsWithoutRef } from 'react';

import { getStoreSettings } from '@client';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  return (
    <div {...props}>
      <p className="text-sm text-slate-500">
        © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
      </p>
    </div>
  );
};
