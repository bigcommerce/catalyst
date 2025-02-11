'use client';
import React, { useEffect, useRef, useState } from 'react';
import FlyoutForm from './RquestQuoteFlyoutForm';



export const RequestQuoteFlyout = () => {

  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const handleOpenChange = (open: boolean) => { 
   setIsShippingOpen(open);
   const quoteButton = document.getElementById("custom-quote");
   if (quoteButton) {
     quoteButton.click();
   }
  }

  return (
    <>
    <button onClick={() => handleOpenChange(true)}>Request A Quote</button>
      <FlyoutForm 
       isOpen={isShippingOpen}
       onOpenChange={() => handleOpenChange(false)}
       />
      </>

  );
};