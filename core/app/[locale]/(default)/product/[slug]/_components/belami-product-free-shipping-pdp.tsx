'use client';
import { getDeliveryMessage } from "~/components/management-apis";
import React, { useState, useEffect } from "react";
import { Spinner } from "@/vibes/soul/primitives/spinner";

interface DeliveryMessageProps {
  entityId: number;
  variantId: number;
  isFromPDP: boolean;
}

export const FreeDelivery: React.FC<DeliveryMessageProps> = ({ entityId, variantId, isFromPDP }) => {
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const message = await getDeliveryMessage(entityId, variantId);
        setDeliveryMessage(message);
      } catch (err) {
        setError(err?.message);
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
      <div className="flex justify-center lg:justify-start px-[50px] py-[10px]">
        <Spinner aria-hidden="true" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const isBackorder = deliveryMessage?.includes("Backorder");
  const backgroundColorClass = isBackorder ? 'bg-[#FBF4E9]' : 'bg-transparent';

  return (
    <div className={`flex flex-col ${isFromPDP ? 'items-center' : 'items-start'} lg:items-start`}>
      <div className={`${backgroundColorClass} w-fit ${deliveryMessage ? 'mt-[10px]' : 'mt-[0px]'}`}>
        {isBackorder ? (
          <div>
            <div className='text-[#6A4C1E] font-normal text-sm leading-6 tracking-[0.25px] px-2'>
              {deliveryMessage?.replace(":Backorder", "")?.trim()}
            </div>
          </div>
        ) : (
          <div className='font-normal text-sm leading-6 tracking-[0.25px] px-0'>
            {deliveryMessage}
          </div>
        )}
      </div>
    </div>
  );
};