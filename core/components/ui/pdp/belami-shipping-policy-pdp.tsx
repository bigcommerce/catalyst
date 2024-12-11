import React, { useState } from 'react';

interface FAQItem {
  question: string;
}

interface ShippingPolicyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerText: string;
}

const ShippingPolicyDialog: React.FC<ShippingPolicyDialogProps> = ({
  isOpen,
  onOpenChange,
  triggerText,
}) => {
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
        className="mt-0 w-full text-center text-base font-normal text-[#008BB7] underline"
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
                  Shipping Policy
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
              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                We ship to any state in the US as well as Southern Canadian Territories. We have a
                flat rate shipping fee and ship many of our lines with no duty and brokerage fees.
                For a list of brands with no duty and brokerage fees, please{' '}
                <a href="#" className="text-[#353535] underline">
                  click here
                </a>
                . We ship via FedEx/UPS ground service. If you need a product more quickly, please
                contact our customer service team to discuss expedited shipping options (expedited
                shipping is not always possible).
              </p>

              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                We offer free shipping on many brands. For all other lines, for orders under $49 we
                have a flat rate of $14.99 when shipping within the US and Canada.
              </p>

              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                Orders shipped to Hawaii and Alaska incur a destination surcharge of $50 on any
                order. The $50 fee is in addition to the $14.99 flat rate for orders under $49.
              </p>

              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                We have a Freight & Handling fee that applies on a small selection of products that
                either ship LTL or require additional handling at the warehouse. This fee would be
                in addition to the destination surcharge and flat rate if applicable.
              </p>

              <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                For orders shipping to Canada, the customer is responsible for all duty, brokerage
                and taxes unless the manufacturing line is part of our Preferred supplier list.
                Please{' '}
                <a href="#" className="text-[#353535] underline">
                  click here
                </a>{' '}
                to view Preferred Suppliers for Canada.
              </p>

              {/* FAQ Section */}
              <div className="mb-4 mt-4 text-left text-[15px] font-medium text-gray-900">
                F.A.Q.
              </div>

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
                      >
                        <ChevronIcon />
                      </div>
                    </button>
                    {openItem === item.question && (
                      <div className="bg-white px-3 py-2">
                        <p className="text-left text-[14px] leading-[24px] text-gray-600">
                          {item.question}
                        </p>
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
  { question: 'Do you charge for shipping?' },
  { question: 'Are there any exceptions to your free shipping policy?' },
  { question: 'Do you offer expedited shipping?' },
  { question: 'Do you ship internationally?' },
  { question: 'What is your delivery incentive program?' },
  { question: 'My order shows delivered but I never received it' },
  { question: 'Can I change my shipping address post-order?' },
  { question: 'Can you ship with USPS?' },
  { question: 'Can you ship to a PO Box?' },
  { question: 'If I return an order, will I be credited for shipping fees I paid?' },
  { question: 'Why does my shipment show "truck" for the carrier?' },
  { question: 'Do you ship with a signature required for delivery?' },
];

export default ShippingPolicyDialog;
