'use client';
import React, { useState } from 'react';
import AgentLogin from '../common-components/agent-login/index';

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
      <AgentLogin isOpen={isModalOpen} toggleModal={toggleModal} />

      {/* Trigger to open the modal */}
      <div className="cursor-pointer text-[14px] font-normal" onClick={toggleModal}>
        Agent Login
      </div>
      <div className="cursor-pointer text-[14px] font-normal">Create Quote</div>
      <div className="cursor-default text-[14px] font-normal">Session Id: ########</div>
    </>
  );
}
