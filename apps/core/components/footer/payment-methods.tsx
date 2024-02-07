import { ComponentPropsWithoutRef } from 'react';

import { AmazonIcon } from '../payment-icons/amazon';
import { AmericanExpressIcon } from '../payment-icons/american-express';
import { ApplePayIcon } from '../payment-icons/apple-pay';
import { MastercardIcon } from '../payment-icons/mastercard';
import { PayPalIcon } from '../payment-icons/paypal';
import { VisaIcon } from '../payment-icons/visa';

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
