'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReturnPolicyDialog from './belami-return-policy-pdp';
import ShippingPolicyDialog from './belami-shipping-policy-pdp';

export const ShippingReturns: React.FC = () => {
  const t = useTranslations('shippingReturns');
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  return (
    <div className="mt-4 flex justify-center gap-5 text-center text-[#4EAECC] xl:mt-[1.5rem]">
      <ShippingPolicyDialog
        isOpen={isShippingOpen}
        onOpenChange={setIsShippingOpen}
        triggerText={t('shippingPolicy')}
      />
      <ReturnPolicyDialog
        isOpen={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        triggerText={t('returnPolicy')}
      />
    </div>
  );
};
