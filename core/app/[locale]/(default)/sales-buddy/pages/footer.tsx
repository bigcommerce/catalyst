'use client';
import React, { useState } from 'react';
import AgentLogin from '../common-components/agent-login/index';
import ReferralId from './referral';
import SessionId from './session';

export default function AgentFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }
  };

  return (
    <>
      {/* Pass modal control to AgentLogin */}
      <ReferralId />
      <AgentLogin isOpen={isModalOpen} toggleModal={toggleModal} />

      {/* Trigger to open the modal */}
      <div className=" cursor-pointer hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20  text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white" onClick={toggleModal}>
        Agent Login
      </div>
      <div className=" cursor-pointer hover:text-primary flex justify-space focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20  text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white">Create Quote</div>
      <SessionId />
    </>
  );
}
