import React from 'react';
import Image from 'next/image';

interface PartnerBenefitsProps {
  tradeCircleCircle: string;
}

const TradeForm: React.FC<PartnerBenefitsProps> = ({ tradeCircleCircle }) => {
  return (
    <div className="mb-8 lg:mb-0 lg:w-1/2 lg:pl-[5em] lg:pr-[9em]">
      <h1 className="text-brand-700 mb-3 text-left text-[60px] font-bold leading-[81.71px] tracking-[-0.5px]">
        Let us be a Partner in your success.
      </h1>

      {/* We save YOU Money section */}
      <div className="mb-3 text-left text-[24px] font-bold leading-[32px] text-[#353535]">
        We save YOU Money
      </div>

      <div className="mb-3 text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#353535]">
        An Industry Best 25% Pro Discount
      </div>

      <div className="mb-3 flex items-center gap-4">
        <Image
          width={18}
          height={18}
          src={tradeCircleCircle}
          className="trade-check-circle"
          alt="Checkmark"
          unoptimized={true}
        />
        <p className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#353535]">
          Volume Pricing - More Units, More Savings
        </p>
      </div>

      <div className="mb-3 flex items-center gap-4">
        <Image
          width={18}
          height={18}
          src={tradeCircleCircle}
          className="trade-check-circle"
          alt="Checkmark"
          unoptimized={true}
        />
        <p className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#353535]">
          90 Day Credit Terms for Qualified Partners
        </p>
      </div>

      {/* Buy with Confidence section */}
      <div className="mb-3 text-left text-[24px] font-bold leading-[32px] text-[#353535]">
        Buy with Confidence
      </div>

      <div className="mb-3 flex items-center gap-4">
        <Image
          width={18}
          height={18}
          src={tradeCircleCircle}
          className="trade-check-circle"
          alt="Checkmark"
          unoptimized={true}
        />
        <p className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#353535]">
          Exclusive 90 Day Return Window
        </p>
      </div>

      <div className="mb-3 flex items-center gap-4">
        <Image
          width={18}
          height={18}
          src={tradeCircleCircle}
          className="trade-check-circle"
          alt="Checkmark"
          unoptimized={true}
        />
        <p className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#353535]">
          Free Lifetime Warranty
        </p>
      </div>
    </div>
  );
};

export default TradeForm;