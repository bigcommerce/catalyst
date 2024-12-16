import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface ReturnPolicyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerText: string;
}

const ReturnPolicyDialog: React.FC<ReturnPolicyDialogProps> = ({
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
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white p-[30px] pb-4">
              <div className="flex justify-between">
                <h2 className="w-full pt-[45px] text-center text-[24px] font-normal leading-[32px] text-[#353535] sm:text-left">
                  Return Policy
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

            {/* Content */}
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 max-h-[calc(80vh-120px)] overflow-y-auto px-[30px] pb-[30px]">
              {/* Policy Text */}
              <p className="mb-3 text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                We strive to provide our customers with high-quality products and a seamless
                shopping experience, but since things can sometimes be hard to fit if a product is
                not right for you, we'll gladly assist with a return or refund.
              </p>

              {/* Eligible Items Section */}
              <div className="mb-3 text-left">
                <h3 className="mb-3 text-[15px] font-medium text-gray-900">
                  Items Eligible for Return
                </h3>
                <ul className="list-decimal space-y-2 pl-5 text-[14px] leading-[24px] text-gray-600">
                  <li>Items received within the last 30 days</li>
                  <li>Items in their original condition, untouched and unaltered</li>
                </ul>
              </div>

              {/* Not Eligible Items Section */}
              <div className="mb-3 text-left">
                <h3 className="mb-3 text-[15px] font-medium text-gray-900">
                  Items NOT Eligible for Return
                </h3>
                <ul className="list-decimal space-y-2 pl-5 text-[14px] leading-[24px] text-gray-600">
                  <li>Made-to-order, custom, or special-order items</li>
                  <li>Clearance and clearance items</li>
                  <li>Discontinued/final sale shipping options</li>
                  <li>Used parts and accessories (e.g. bulbs, clean rods, extra shelving)</li>
                </ul>
              </div>

              {/* Shipping Options Section */}
              <div className="mb-3 text-left">
                <h3 className="mb-3 text-[15px] font-medium text-gray-900">
                  Return Shipping Options
                </h3>
                <div className="space-y-3 text-[14px] leading-[24px] text-gray-600">
                  <p>
                    <strong>Option One:</strong> We generate a pre-generated shipping label + 10%
                    return fee will be deducted from your refund. <strong>Please Note:</strong> This
                    option is not available for orders required to be freight or for items shipped
                    to Hawaii, Alaska or Canada
                  </p>
                  <p>
                    <strong>Option Two:</strong> You arrange return shipping with the carrier of
                    your choice at your expense.
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mb-4 mt-5">
                <h3 className="mb-4 text-left text-[15px] font-medium text-gray-900">F.A.Q.</h3>
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
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
    question: 'Are clearance products returnable?',
    answer: 'No, clearance items and final sale products are not eligible for return.',
  },
  {
    question: 'Do you charge restocking fees?',
    answer:
      'Yes, if you choose to use our pre-generated shipping label, a 10% return fee will be deducted from your refund.',
  },
  {
    question: 'How do I ship the item back?',
    answer:
      'You have two options: 1) Use our pre-generated shipping label (10% fee applies) or 2) Arrange your own shipping with a carrier of your choice.',
  },
  {
    question: 'How long does it take to receive a refund?',
    answer: 'Once we receive your return, refunds typically process within 5-7 business days.',
  },
  {
    question: 'My item was damaged, what do I do?',
    answer:
      'Please contact our customer service team immediately with photos of the damage for assistance.',
  },
  {
    question: 'My shipment was refused or returned to sender, what happens now?',
    answer:
      'Please contact our customer service team for guidance on refused or returned shipments.',
  },
];

export default ReturnPolicyDialog;
