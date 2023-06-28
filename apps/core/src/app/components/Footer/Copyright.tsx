import { getStoreSettings } from '@bigcommerce/catalyst-client';
import { FooterSection } from '@bigcommerce/reactant/Footer';
import { ComponentPropsWithoutRef } from 'react';

export const Copyright = async (props: ComponentPropsWithoutRef<'div'>) => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  return (
    <FooterSection className="sm:order-first" {...props}>
      <p className="text-gray-500">
        © {new Date().getFullYear()} {settings.storeName} – Powered by BigCommerce
      </p>
    </FooterSection>
  );
};
