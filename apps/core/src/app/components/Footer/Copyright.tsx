import { getStoreSettings } from '@bigcommerce/catalyst-client';
import { ComponentPropsWithoutRef } from 'react';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  return (
    <div {...props}>
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
      </p>
    </div>
  );
};
