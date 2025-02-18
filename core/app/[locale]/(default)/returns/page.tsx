import React from 'react';
import Returns from './ReturnIframe';

interface returnsProps{
  searchParams: { orderId?: string; email?: string };
}

const ReturnsPage = ({searchParams}:returnsProps) => {

  const orderId = searchParams.orderId || '';
  const email = searchParams.email || '';

  let returnUrl: any
  if(orderId && email){
    returnUrl = `${process?.env?.AFTERSHIP_ORDER_STATUS}?order-number=${orderId}&email=${email}`;
  } else {
    returnUrl = `${process?.env?.NEXT_PUBLIC_RETURN_URL}`;
  }
  
  return <Returns returnUrl={returnUrl} />;
};

export default ReturnsPage;
