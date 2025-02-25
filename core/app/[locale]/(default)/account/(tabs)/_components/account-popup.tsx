'use client';

import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface accountProp {
  sessionUser?: any;
  customerGroupDetails?: { name?: string };
}
const AccountPopup = ({ sessionUser, customerGroupDetails }: accountProp) => {
  const t = useTranslations('Account.Home');
  const [showPopup, setShowPopup] = useState(false);
  const name = customerGroupDetails?.name;

  useEffect(() => {
    if (
      sessionUser &&
      !localStorage.getItem('account_popup') &&
      ['PRO - 1', 'PRO - 2', 'PRO - 3'].includes(name || '')
    ) {
      setShowPopup(true);
      localStorage.setItem('account_popup', 'true');
    }
  }, [sessionUser]);

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;
  return (
    <div className="animate-topToBottom fixed top-0 z-30 w-full">
      <div className="flex flex-col items-center gap-[5px] bg-[#EACA93] p-5 sm:flex-row xl:gap-0 xl:px-[30px] xl:py-[18px]">
        <div className="flex flex-1 flex-col items-center gap-[5px] text-center xl:gap-0">
          <div className="text-[16px] font-bold leading-[32px] tracking-[0.15px] text-[#353535] xl:text-[20px]">
            {t('welcomeMessagePop')}
          </div>
          <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
            {t('tradePricingPop')}
          </div>
        </div>
        <div>
          {' '}
          <button onClick={handleClose}>
            <X strokeWidth={1.5} className="text-neutral-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPopup;
