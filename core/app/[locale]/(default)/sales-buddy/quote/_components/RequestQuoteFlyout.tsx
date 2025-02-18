'use client';
import React, { useEffect, useRef, useState } from 'react';
import FlyoutForm from './RquestQuoteFlyoutForm';
import { usePathname } from 'next/navigation';


export const RequestQuoteFlyout = () => {

  const pathname = usePathname();
  
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
    <button id="Request-quote" onClick={() => handleOpenChange(true)}>{ pathname === '/sales-buddy/quote/' ? "Create a quote" : "Request A Quote" }</button>
      <FlyoutForm 
       isOpen={isShippingOpen}
       onOpenChange={() => handleOpenChange(false)}
       />
      </>

  );
};