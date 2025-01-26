"use client"
import React, { useEffect, useState } from 'react'
import SalesBuddyAppIndex from '.'
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { usePathname, useSearchParams } from 'next/navigation';
import { InsertShopperVisitedUrl } from './_actions/insert-shopper-url';
import { getCartIdCookie } from './_actions/session';

export default function SalesBuddyPage() {
  const { agentLoginStatus, setAgentLoginStatus, context_session_id, cartIdForCheck, setCartIdForCheck } = useCompareDrawerContext();
  const [urlWithQuery, setUrlWithQuery] = useState('');
  const path = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();    
  useEffect(() => {
    if (context_session_id ){
      const fullUrl = queryString ? `${window.location.protocol}//${window.location.host}${path}?${queryString}` : `${window.location.protocol}//${window.location.host}${path}`;
      // const fullUrl = `${window.location.protocol}//${window.location.host}${path}`;      
      const previousUrl = localStorage.getItem('previous_url');
      if (previousUrl !== fullUrl  ) {
        const insertShopperVisitedUrlFunc = async () => {
          try {
            await InsertShopperVisitedUrl(context_session_id, fullUrl);
            localStorage.setItem('previous_url', fullUrl);
          } catch (error) {
            console.error('Error inserting shopper visited URL:', error);
          }
        };
        insertShopperVisitedUrlFunc();
      }
    }
  }, [path, searchParams, cartIdForCheck]);
  
  
  return (
    <div className='hidden sm:block md:block lg:block z-[999]'>{agentLoginStatus && <SalesBuddyAppIndex />}</div>
  );
}
