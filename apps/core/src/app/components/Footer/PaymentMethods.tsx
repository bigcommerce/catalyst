import { FooterSection } from '@bigcommerce/reactant/Footer';
import { ComponentPropsWithoutRef } from 'react';

import { AmazonIcon } from '../PaymentIcons/Amazon';
import { AmericanExpressIcon } from '../PaymentIcons/AmericanExpress';
import { ApplePayIcon } from '../PaymentIcons/ApplePay';
import { MastercardIcon } from '../PaymentIcons/Mastercard';
import { PayPalIcon } from '../PaymentIcons/PayPal';
import { VisaIcon } from '../PaymentIcons/Visa';

export const PaymentMethods: React.FC<ComponentPropsWithoutRef<'div'>> = (props) => {
  return (
    <FooterSection className="grow flex-row gap-6 sm:justify-end" {...props}>
      <AmazonIcon />
      <AmericanExpressIcon />
      <ApplePayIcon />
      <MastercardIcon />
      <PayPalIcon />
      <VisaIcon />
    </FooterSection>
  );
};
