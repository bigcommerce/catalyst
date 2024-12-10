'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface WarningDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerText: string;
}

const WarningDialog: React.FC<WarningDialogProps> = ({ isOpen, onOpenChange, triggerText }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleAccordion = (e: React.MouseEvent, question: string) => {
    e.stopPropagation();
    setOpenItem(openItem === question ? null : question);
  };

  const handleClose = () => {
    onOpenChange(false);
    setOpenItem(null);
  };

  const ChevronIcon = () => (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transform transition-transform duration-200"
    >
      <path
        d="M1 1L7 7L13 1"
        stroke="#333333"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div>
      <button
        onClick={() => onOpenChange(true)}
        className="mt-4 w-full text-center text-base font-semibold text-gray-700 underline"
      >
        {triggerText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={handleClose} />
          <div className="relative z-50 mx-4 w-full max-w-[90%] rounded bg-white shadow-xl xl:max-w-[38%]">
            {/* Header - Fixed */}
            <div className="sticky top-0 z-10 bg-white p-[30px] pb-4">
              <div className="flex justify-between">
                <h2 className="w-full pt-[45px] text-center text-[24px] font-normal leading-[32px] text-[#353535] sm:text-left">
                  California Prop 65 Warning
                </h2>
                <button
                  onClick={handleClose}
                  className="absolute right-[10em] top-[3em] text-gray-600 sm:right-[2em]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 3L13 13M13 3L3 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 max-h-[calc(80vh-120px)] overflow-y-auto px-[30px] pb-[30px]">
              {/* Warning Text */}
              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px]">
                Some of the products offered on this site may contain chemicals known to the State
                of California to cause cancer and/or birth defects, or other reproductive harm. For
                more information go to{' '}
                <a
                  href="https://www.P65Warnings.ca.gov"
                  className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.P65Warnings.ca.gov
                </a>
              </p>

              {/* FAQ Section */}
              <div className="mb-4 mt-4 text-[15px] font-medium text-gray-900">F.A.Q.</div>

              <div className="space-y-2">
                {faqItems.map((item) => (
                  <div key={item.question} className="overflow-hidden">
                    <button
                      onClick={(e) => toggleAccordion(e, item.question)}
                      className="mb-[10px] flex w-full items-center justify-between bg-[#F3F4F5] px-4 py-3 text-left"
                    >
                      <span className="text-left text-[15px] font-bold leading-[32px] tracking-[0.15px] text-gray-700">
                        {item.question}
                      </span>
                      <div
                        className={`transform transition-transform duration-200 ${
                          openItem === item.question ? 'rotate-180' : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronIcon />
                      </div>
                    </button>
                    {openItem === item.question && (
                      <div className="bg-white px-3 py-2">
                        {item.answer.split('\n').map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="mb-2 text-[14px] leading-[24px] text-gray-600 last:mb-0"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const faqItems: FAQItem[] = [
  {
    question: 'What is Proposition 65?',
    answer:
      'We offer free shipping on many brands. For all other lines, for orders under $49 we have a flat rate of $14.99 when shipping within the US and Canada.\n\nOrders shipped to Hawaii and Alaska incur a destination surcharge of $50 on any order. The $50 fee is in addition to the $14.99 flat rate for orders under $49.\n\nWe have a Freight & Handling fee that applies on a small selection of products that either ship LTL or require additional handling at the warehouse. This fee would be in addition to the destination surcharge and flat rate if applicable.\n\nFor orders shipping to Canada, the customer is responsible for all duty, brokerage and taxes unless the manufacturing line is part of our Preferred supplier list. Please click here to view Preferred Suppliers for Canada.',
  },
  {
    question: 'What types of chemicals are on the Proposition 65 List?',
    answer:
      'The list contains naturally occurring and synthetic chemicals including additives or ingredients in pesticides, common household products, food, drugs, dyes, and solvents. Listed chemicals may also be used in manufacturing and construction, or they may be byproducts of chemical processes.',
  },
  {
    question: 'Where can I get more information on proposition 65?',
    answer:
      'Visit www.P65Warnings.ca.gov for detailed information about Proposition 65, its requirements, and the complete list of chemicals.',
  },
];

export default WarningDialog;
