"use client"
import React, { useEffect, useState } from 'react'
import SalesBuddyAppIndex from '.'
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';

export default function SalesBuddyPage() {
  const { agentLoginStatus, setAgentLoginStatus } = useCompareDrawerContext();

  useEffect(() => {
    const handleStorageChange = () => {
      setAgentLoginStatus(localStorage.getItem('agent_login') === 'true')
    };
  }, [agentLoginStatus]);
  
  return (
    <div className='hidden sm:block md:block lg:block z-[999]'>{agentLoginStatus && <SalesBuddyAppIndex />}</div>
  );
}
