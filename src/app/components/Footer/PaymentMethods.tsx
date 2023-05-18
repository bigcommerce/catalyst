import { ComponentPropsWithoutRef } from 'react';

import { AmazonIcon } from '../../icons/Amazon';
import { AmericanExpressIcon } from '../../icons/AmericanExpress';
import { ApplePayIcon } from '../../icons/ApplePay';
import { MastercardIcon } from '../../icons/Mastercard';
import { PayPalIcon } from '../../icons/PayPal';
import { VisaIcon } from '../../icons/Visa';

export const PaymentMethods: React.FC<ComponentPropsWithoutRef<'div'>> = (props) => {
  return (
    <div {...props}>
      <div className="flex flex-row gap-6 justify-end">
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
