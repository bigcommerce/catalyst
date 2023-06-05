import { ComponentPropsWithoutRef } from 'react';

import { AmazonIcon } from '../PaymentIcons/Amazon';
import { AmericanExpressIcon } from '../PaymentIcons/AmericanExpress';
import { ApplePayIcon } from '../PaymentIcons/ApplePay';
import { MastercardIcon } from '../PaymentIcons/Mastercard';
import { PayPalIcon } from '../PaymentIcons/PayPal';
import { VisaIcon } from '../PaymentIcons/Visa';

export const PaymentMethods: React.FC<ComponentPropsWithoutRef<'div'>> = (props) => {
  return (
    <div {...props}>
      <div className="flex flex-row justify-end gap-6">
        <AmazonIcon />
        <AmericanExpressIcon />
        <ApplePayIcon />
        <MastercardIcon />
        <PayPalIcon />
        <VisaIcon />
      </div>
    </div>
  );
};
