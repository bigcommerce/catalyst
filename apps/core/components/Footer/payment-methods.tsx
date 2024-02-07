import { ComponentPropsWithoutRef } from 'react';

import { AmazonIcon } from '../PaymentIcons/amazon';
import { AmericanExpressIcon } from '../PaymentIcons/american-express';
import { ApplePayIcon } from '../PaymentIcons/apple-pay';
import { MastercardIcon } from '../PaymentIcons/mastercard';
import { PayPalIcon } from '../PaymentIcons/paypal';
import { VisaIcon } from '../PaymentIcons/visa';

export const PaymentMethods: React.FC<ComponentPropsWithoutRef<'div'>> = (props) => {
  return (
    <div className="flex flex-row gap-6" {...props}>
      <AmazonIcon />
      <AmericanExpressIcon />
      <ApplePayIcon />
      <MastercardIcon />
      <PayPalIcon />
      <VisaIcon />
    </div>
  );
};
