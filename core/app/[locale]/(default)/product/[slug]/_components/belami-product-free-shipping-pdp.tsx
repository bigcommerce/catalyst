'use client';
import { getMetaFieldValue } from "~/components/management-apis";
import React, { useState, useEffect } from "react";
import { Spinner } from "@/vibes/soul/primitives/spinner";

interface DeliveryMessageProps {
  entityId: number;
  variantId: number;
  isFromPDP: boolean;
}

export const DeliveryMessage: React.FC<DeliveryMessageProps> = ({
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
        const message = await getMetaFieldValue(entityId, variantId, "delivery_message");
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
      {
        deliveryMessage && deliveryMessage[0] && (
          <div className={`${deliveryMessage[0]?.qty === 0 ? 'bg-[#FBF4E9] px-[10px]' : 'bg-transparent'} w-fit mt-[10px]`}>
            <div className='font-normal text-sm leading-6 tracking-[0.25px] px-0'>
              {deliveryMessage[0]?.delivery_estimated_text}
            </div>
          </div>
        )
      }
      
    </div>
    
  );
};