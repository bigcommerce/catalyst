import { getStoreSettings } from '@bigcommerce/catalyst-client';
import { FooterAddendumCopyright } from '@bigcommerce/reactant/Footer';
import { ComponentPropsWithoutRef } from 'react';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  return (
    <FooterAddendumCopyright {...props}>
      © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
    </FooterAddendumCopyright>
  );
};
