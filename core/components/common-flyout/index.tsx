'use client';
import React, { useState } from 'react';
import CommonFlyout from './flyouts';
type FlyoutProps = {
  triggerLabel: React.ReactNode;
  children: React.ReactNode;
  from?:string;
};


export const Flyout: React.FC<FlyoutProps> = ({triggerLabel,children, from}) => {

  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
   setIsShippingOpen(open);}
  return (
    <>
    <button className={`${from === 'warning-california' ? 'w-full' : ''}`} onClick={() => handleOpenChange(true)}>{triggerLabel}</button>
      <CommonFlyout
        isOpen={isShippingOpen}
        onOpenChange={() => handleOpenChange(false)}
        triggerLabel={triggerLabel}
        children={children}
      />
      </>

  );
};
