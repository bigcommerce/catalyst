'use client';

import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useEffect, useRef, useState } from "react";
import PrintOrderSummary from "./print-order-summary";
import { getGuestOrderDetails } from "~/components/graphql-apis";

interface OrderDataType {
  orderId: number;
  cartId: string;
}

export const PrintOrder = ({ orderId, cartId }: OrderDataType) => {
  const [orderData, setOrderData] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const getOrderData = async(orderId: number) => {
      let orderInfo: any = await getGuestOrderDetails({
        filter: {
          entityId: orderId,
          cartEntityId: cartId
        }
      });
      setOrderData(orderInfo);
      return orderInfo;
    }
    getOrderData(orderId);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef
  });
  return (
    <>
      <PrinterIcon className='stroke-[#008bb7]' />
      <button onClick={() => handlePrint()} className="text-[#008BB7]">Print</button>
      {orderData?.orderState && (<div className="hidden"><PrintOrderSummary data={orderData} innerRef={contentRef} /></div>)}
    </>
  );
};