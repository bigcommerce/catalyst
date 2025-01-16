'use client';
import React, { useEffect, useState } from 'react';
import AgentLogin from '../common-components/agent-login/index';
import ReferralId from './referral';
import SessionId from './session';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { useRouter } from 'next/navigation'; // Import useRouter
import { storeAgentLoginStatusInCookies } from '../_actions/agent-login';
export default function AgentFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { agentLoginStatus, setAgentLoginStatus,agentName } = useCompareDrawerContext();
  const router = useRouter(); // Initialize useRouter

  const toggleModal = () => {
    if (agentLoginStatus) {
      localStorage.setItem('agent_login', 'false');
      localStorage.removeItem('agent_role'); // Remove agent_role from localStorage
      setAgentLoginStatus(false);
      storeAgentLoginStatusInCookies(false)
      router.refresh() // Refresh the page
    } else {
      setIsModalOpen(!isModalOpen);
      if (!isModalOpen) {
        document.body.style.overflow = 'hidden'; // Disable scrolling
      } else {
        document.body.style.overflow = 'auto'; // Enable scrolling
      }
    }
  };

  useEffect(() => {    
    setAgentLoginStatus(localStorage.getItem('agent_login') === 'true')
    router.refresh();
  }, [agentLoginStatus]);
  

  return (
    <>
      <nav className="grid grid-cols-1 gap-4 grid-flow-row" id="nav-footer-section">
        <ReferralId />
        <AgentLogin isOpen={isModalOpen} toggleModal={toggleModal} />

        {/* Trigger to open the modal */}
        <div className="hidden  sm:block md:block lg:block cursor-pointer hover:text-primary flex justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white" onClick={toggleModal}>
          {!agentLoginStatus ? "Agent Login" : `${agentName ? agentName :''} Logout`}
        </div>
        <div className="cursor-pointer hover:text-primary flex  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 text-[14px] font-normal leading-[24px] tracking-[0.25px] !text-white">
          Create Quote
        </div>
        <SessionId />
      </nav>
      {/* Pass modal control to AgentLogin */}

    </>
  );
}
