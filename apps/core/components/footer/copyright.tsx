import { ComponentPropsWithoutRef } from 'react';

import { getStoreSettings } from '~/client/queries/get-store-settings';

export const Copyright = async (props: ComponentPropsWithoutRef<'p'>) => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  return (
    <p className="text-gray-500 sm:order-first" {...props}>
      © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
    </p>
  );
};
