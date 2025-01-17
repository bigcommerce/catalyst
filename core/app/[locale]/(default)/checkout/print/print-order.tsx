'use client';

import { PrinterIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useEffect, useRef, useState } from 'react';
import PrintOrderSummary from './print-order-summary';
import { getGuestOrderDetails, getOrderDetails } from '~/components/graphql-apis';

interface OrderDataType {
  orderId: number;
  cartId: string;
  guestUser: number;
  from?: string;
}

export const PrintOrder = ({ orderId, cartId, guestUser, from }: OrderDataType) => {
  const [orderData, setOrderData] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const getOrderData = async (orderId: number) => {
      let orderInfo: any = {};
      if (guestUser == 1) {
        orderInfo = await getGuestOrderDetails({
          filter: {
            entityId: orderId,
            cartEntityId: cartId,
          },
        });
      } else {
        orderInfo = await getOrderDetails({
          filter: {
            entityId: orderId,
          },
        });
      }
      setOrderData(orderInfo);
      return orderInfo;
    };
    getOrderData(orderId);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef,
  });
  return (
    <>
      {from == 'order' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M14 6.5H13V0.5H3V6.5H2C0.89 6.5 0 7.4 0 8.5V15.5H16V8.5C16 7.4 15.11 6.5 14 6.5ZM5 2.5H11V6.5H5V2.5ZM14 13.5H2V8.5H14V13.5ZM13 11.5H9V9.5H13V11.5Z"
            fill="#7F7F7F"
          />
        </svg>
      ) : (
        <PrinterIcon className="stroke-[#008bb7]" />
      )}
      <button onClick={() => handlePrint()} className={`${from == 'order' ? 'text-[#7F7F7F]' : 'text-[#008BB7]'}`}>
        Print
      </button>
      {orderData?.orderState && (
        <div className="hidden">
          <PrintOrderSummary data={orderData} innerRef={contentRef} />
        </div>
      )}
    </>
  );
};
