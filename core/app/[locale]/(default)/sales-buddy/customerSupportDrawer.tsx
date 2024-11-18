'use client';
import React, { useState } from 'react'
import InternalSearch from './_components/internalSearch';
import AppIcon from "./assets/image.png";
import AgentTools from './_components/agentToolDrawer';
import CartInterface from './_components/cartInterface';
import Image from 'next/image';

export default function CustomerSupportDrawer() {
  // State to control the visibility of the drawer modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // State to manage open status of multiple accordion items
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);

  // Function to toggle the drawer
  const toggleDrawer = () => setIsOpen(!isOpen);

  // Function to toggle each accordion item
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prevOpenAccordions) =>
      prevOpenAccordions.includes(index)
        ? prevOpenAccordions.filter((i) => i !== index)
        : [...prevOpenAccordions, index],
    );
  };

  return (
    <div className='fixed top-[520px] bg-[#353535] border-4 border-[#FFFE98] w-[164px] h-[164px] left-[50px] rounded-full shadow-lg'>
      {/* Icon button to open the drawer */}
      <button
        onClick={toggleDrawer}
        className=" p-10 hover:pointer focus:outline-none"
      >
        <Image src={AppIcon} alt="App-icon" />
        {/* <span>🛎️</span> /* Customer support icon */}
      </button>

      {/* Drawer modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 flex justify-end"
            onClick={toggleDrawer} // Close drawer when background is clicked
          >

            <div
              className="relative h-full overflow-y-auto bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside drawer
              style={{ transform: 'translateX(0)', width: '500px' }}
            >
              {/* Close button */}
              <div className='w-[483px] bg-[#353535] h-[72px] flex justify-start items-center pt-[20px] pb-[20px] pr-[40px] pl-[40px] gap-2.5'>
                <Image className="w-[28px] h-[25.2px]" src={AppIcon} alt="header" />
                <span className='w-[146px] h-[32px] text-white font-bold text-[24px] color-[#FFFF]'> Agent Tools</span>
                <span className='ml-[190px] text-white'>
                  <button
                    onClick={toggleDrawer}
                    className=" text-white-500 w-[14px] h-[14px] hover:text-gray-700"
                  >
                    ✖
                  </button>
                </span>
              </div>
              <div className='p-4 bg-[#f3f4f5]'>
                <div>
                  <CartInterface />
                </div>
                {/* Drawer content */}
                <div className="mt-8">
                  <h2 className="mb-4 text-xl font-semibold">Customer Support</h2>

                  {/* Accordion Sections */}
                  <div>
                    {/* Customer Cart Lookup */}
                    <h2>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 border border-b-0 border-gray-200 p-4 text-gray-500 hover:bg-gray-100 dark:border-gray-700"
                        onClick={() => toggleAccordion(1)}
                        aria-expanded={openAccordions.includes(1)}
                      >
                        <span>🛒 Customer Cart Lookup</span>
                        <svg
                          className={`h-3 w-3 transform ${openAccordions.includes(1) ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                          />
                        </svg>
                      </button>
                    </h2>
                    {openAccordions.includes(1) && (
                      <div className="border border-b-0 border-gray-200 p-1 dark:border-gray-700 dark:bg-gray-900">
                        <input
                          type="text"
                          placeholder="Enter Cart ID"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <button
                          className="mt-2 w-full rounded p-2 text-white"
                          style={{ backgroundColor: '#1DB14B' }}
                        >
                          Fetch Cart
                        </button>
                      </div>
                    )}

                    {/* Find Customer */}
                    <h2>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 border border-b-0 border-gray-200 p-4 text-gray-500 hover:bg-gray-100 dark:border-gray-700"
                        onClick={() => toggleAccordion(2)}
                        aria-expanded={openAccordions.includes(2)}
                      >
                        <span>🔍 Find Customer</span>
                        <svg
                          className={`h-3 w-3 transform ${openAccordions.includes(2) ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                          />
                        </svg>
                      </button>
                    </h2>
                    {openAccordions.includes(2) && (
                      <div className="border border-b-0 border-gray-200 p-1 dark:border-gray-700 dark:bg-gray-900">
                        <input
                          type="email"
                          placeholder="Email"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <input
                          type="text"
                          placeholder="Name"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <button
                          className="mt-2 w-full rounded p-2 text-white"
                          style={{ backgroundColor: '#1DB14B' }}
                        >
                          Find Customer
                        </button>
                      </div>
                    )}

                    {/* Create a New Account */}
                    <h2>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 border border-gray-200 p-4 text-gray-500 hover:bg-gray-100 dark:border-gray-700"
                        onClick={() => toggleAccordion(3)}
                        aria-expanded={openAccordions.includes(3)}
                      >
                        <span>🧑‍🤝‍🧑 Create a New Account</span>
                        <svg
                          className={`h-3 w-3 transform ${openAccordions.includes(3) ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                          />
                        </svg>
                      </button>
                    </h2>
                    {openAccordions.includes(3) && (
                      <div className="border border-t-0 border-gray-200 p-1 dark:border-gray-700 dark:bg-gray-900">
                        {/* Content for Create a New Account accordion */}
                        <input
                          type="text"
                          placeholder="Account Name"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <input
                          type="text"
                          placeholder="Account Type"
                          className="mt-2 w-full rounded border p-2"
                        />
                        <button
                          className="mt-2 w-full rounded p-2 text-white"
                          style={{ backgroundColor: '#1DB14B' }}
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <InternalSearch />
                </div>
                <div className="mt-5">
                  <AgentTools />
                </div>

              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
