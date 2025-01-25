'use client';
import { useTranslations } from 'next-intl';
import { getDeliveryMessage } from '~/components/management-apis';
import React, { useState, useEffect } from 'react';
import { Spinner } from '@/vibes/soul/primitives/spinner';

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
        setError(err?.message);
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
      <div className="flex justify-center px-[50px] py-[30px] lg:justify-start">
        <Spinner aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if the deliveryMessage includes "Backorder"
  const isBackorder = deliveryMessage?.includes('Backorder');

  // Determine background color based on Backorder presence
  const backgroundColorClass = isBackorder ? 'bg-[#FBF4E9]' : 'bg-transparent';

  return (
    <div
      className={`mt-[5px] flex flex-col ${isFromPDP ? 'items-center' : 'items-start'} lg:items-start`}
    >
      <div className="text-sm font-normal leading-6 tracking-[0.25px]">{t('title')}</div>
      <div className={`${backgroundColorClass} mt-[5px] w-fit`}>
        {isBackorder ? (
          <div>
            <div className="px-2 text-sm font-normal leading-6 tracking-[0.25px] text-[#6A4C1E]">
              {deliveryMessage?.replace(':Backorder', '')?.trim() || ''}
            </div>
          </div>
        ) : (
          <div className="px-0 text-sm font-normal leading-6 tracking-[0.25px]">
            {deliveryMessage || ''}
          </div>
        )}
      </div>
    </div>
  );
};
