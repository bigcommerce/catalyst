'use client';
import { getDeliveryMessage } from "~/components/management-apis";
import React, { useState, useEffect } from "react";
import { Spinner } from "@/vibes/soul/primitives/spinner";

interface DeliveryMessageProps {
  entityId: number;
  variantId: number;
  isFromPDP: boolean;
}

export const FreeDelivery: React.FC<DeliveryMessageProps> = ({
  entityId,
  variantId,
  isFromPDP,
}) => {
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const message = await getDeliveryMessage(entityId, variantId);
        setDeliveryMessage(message);
      } catch (err) {
        ('');
      } finally {
        setLoading(false);
      }
    };

    if (entityId && variantId) {
      fetchMessage();
    }
  }, [entityId, variantId]);

  if (loading) {
    return (
      <div className="flex justify-center xl:justify-start px-[50px] py-[10px]">
        <Spinner aria-hidden="true" />
      </div>
    )
  }
  
  return (
    <div className={`flex ${isFromPDP ? 'justify-center' : 'justify-start'}  xl:justify-start`}>
       {deliveryMessage?.map((item:any, index:any) => {
        const backgroundColorClass = item?.qty == 0 ? 'bg-[#FBF4E9] px-[10px]' : 'bg-transparent'; // Set background based on qty
        return (
          <div key={index} className={`${backgroundColorClass} w-fit mt-[10px]`}>
            <div className='font-normal text-sm leading-6 tracking-[0.25px] px-0'>
              {item.delivery_estimated_text}
            </div>
          </div>
        );
      })}
    </div>
  );
};