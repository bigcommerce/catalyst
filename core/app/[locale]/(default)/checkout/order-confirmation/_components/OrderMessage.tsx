//import { useTranslations } from 'next-intl';

//import { FragmentOf, graphql } from '~/client/graphql';
//import { greentick } from './img/green-tick.png';

// export const DescriptionFragment = graphql(`
//   fragment DescriptionFragment on Product {
//     description
//   }
// `);

interface OrderMessageProps {
  email: string;
}

export const OrderMessage = ({ email }: OrderMessageProps) => {
  return (
    <div id="order-message">
        <span><img src="greentick" id="tick" alt="order-status"/></span><span>Your order has been placed.</span>
        <span>We have received your order. You will receive an email confirmation at </span>
        <span>{email}</span>
    </div>
  );
};