'use client';
import { useTranslations } from 'next-intl';
import { getDeliveryMessage } from "~/components/management-apis";
import React, { useState, useEffect } from "react";
import { Spinner } from "@/vibes/soul/primitives/spinner";

interface DeliveryMessageProps {
  entityId: number;
  variantId: number;
  isFromPDP: boolean;
}

export const FreeDelivery: React.FC<DeliveryMessageProps> = ({ entityId, variantId, isFromPDP }) => {
  const t = useTranslations('freeDelivery');
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (entityId && variantId) {
      fetchMessage();
    }
  }, [entityId, variantId]); // Dependencies to trigger fetch on change

  if (loading) {
    return ( 
      <div className="flex justify-center lg:justify-start px-[50px] py-[30px]">
        <Spinner aria-hidden="true" />
      </div>
    );
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if the deliveryMessage includes "Backorder"
  const isBackorder = deliveryMessage?.includes("Backorder");

  // Determine background color based on Backorder presence
  const backgroundColorClass = isBackorder ? 'bg-[#FBF4E9]' : 'bg-transparent';

  return (
    <div className={`mt-[10px] flex flex-col ${isFromPDP ? 'items-center' : 'items-start'} lg:items-start`}>
      <div className="text-gray-700 text-base leading-8 tracking-wide"> 
        {t('title')} 
      </div>
      <div className={`${backgroundColorClass} w-fit px-1 py-0 mt-[10px]`}>
        {isBackorder ? (
          <div>
            {/* <strong>Important:</strong> The delivery message includes a backorder. */}
            <div>{deliveryMessage?.replace(":Backorder", "").trim() || 'No delivery message available.'}</div>
          </div>
        ) : (
          <div>{deliveryMessage || 'No delivery message available.'}</div>
        )}
      </div>
    </div>
  );
};