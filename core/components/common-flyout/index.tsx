'use client';
import React, { useState } from 'react';
import CommonFlyout from './flyouts';
type FlyoutProps = {
  triggerLabel: React.ReactNode;
  children: React.ReactNode;

};



export const Flyout: React.FC<FlyoutProps> = ({triggerLabel,children}) => {

  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
   setIsShippingOpen(open);}
  return (
    <>
    <button onClick={() => handleOpenChange(true)}>{triggerLabel}</button>
      <CommonFlyout
        isOpen={isShippingOpen}
        onOpenChange={() => handleOpenChange(false)}
        triggerLabel={triggerLabel}
        children={children}
      />
      </>

  );
};
