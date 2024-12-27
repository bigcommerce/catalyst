'use client';

import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useEffect, useRef, useState } from "react";
import PrintOrderSummary from "./print-order-summary";
import { getOrderDetails } from "~/components/graphql-apis";

interface OrderDataType {
  orderId: number
}

export const PrintInvoice = ({ orderId }: OrderDataType) => {
  const [orderData, setOrderData] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const getOrderData = async(orderId: number) => {
      let orderInfo: any = await getOrderDetails({
        filter: {
          entityId: orderId
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
      <button onClick={() => handlePrint()} className="text-[#008BB7]">Print Invoice</button>
      {orderData?.orderState && (<div className="hidden"><PrintOrderSummary data={orderData} innerRef={contentRef} /></div>)}
    </>
  );
};