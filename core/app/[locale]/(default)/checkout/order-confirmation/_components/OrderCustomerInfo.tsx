//import { useTranslations } from 'next-intl';

//import { FragmentOf, graphql } from '~/client/graphql';
//import { greentick } from './img/green-tick.png';

// export const DescriptionFragment = graphql(`
//   fragment DescriptionFragment on Product {
//     description
//   }
// `);

declare interface Order {
    baseAmount: number;
    billingAddress: OrderBillingAddress;
    cartId: string;
    coupons: Coupon[];
    consignments: OrderConsignment;
    currency: Currency_2;
    customerCanBeCreated: boolean;
    customerId: number;
    customerMessage: string;
    discountAmount: number;
    handlingCostTotal: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: LineItemMap;
    orderAmount: number;
    orderAmountAsInteger: number;
    orderId: number;
    payments?: OrderPayments;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
    channelId: number;
    fees: OrderFee[];
}

interface OrderCustomerInfoProps {
    order?: Order;
}
  
  export const OrderCustomerInfo = ({ email }: OrderCustomerInfoProps) => {
    return (
      <div id="order-message">
          <span><img src="greentick" id="tick" alt="order-status"/></span><span>Your order has been placed.</span>
          <span>We have received your order. You will receive an email confirmation at </span>
          <span>{email}</span>
      </div>
    );
  };