import React from 'react';
import Image from 'next/image';

interface PartnerBenefitsProps {
  tradeCircleCircle: string;
}

const TradeForm: React.FC<PartnerBenefitsProps> = ({ tradeCircleCircle }) => {
  return (
    // <div className="mb-4 lg:mb-0 lg:w-1/2 lg:pl-[5em] lg:pr-[9em]">
    <div className="mb-4 lg:mb-0 lg:w-1/2 lg:pl-[2em] xl:pl-[5em] xl:pr-[9em]">
      <h1 className="text-brand-700 mb-3 text-center text-[25px] font-normal lg:font-bold leading-[32px] tracking-[-0.5px] lg:text-left lg:text-[60px] lg:leading-[81.71px]">
        Let us be a Partner in your success.
      </h1>
      {/* We save YOU Money section */}
      <div className="mb-3 text-center lg:text-left text-[20px] lg:leading-[22px] lg:text-[24px] font-bold leading-[32px] text-[#353535]">
        We save YOU Money
      </div>

      <div className="mb-3 flex items-center gap-4">
        <Image
          width={18}
          height={18}
          src={tradeCircleCircle}
          className="trade-check-circle block lg:hidden"
          alt="Checkmark"
          unoptimized={true}
        />
        <p className="text-left text-[16px] leading-[22px] lg:text-[20px]   font-medium lg:leading-[32px] tracking-[0.15px] text-[#353535]">
        An Industry Best 25% Pro Discount
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
        <p className="text-left text-[16px] leading-[22px] lg:text-[20px] font-medium lg:leading-[32px] tracking-[0.15px] text-[#353535]">
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
        <p className="text-left text-[16px] leading-[22px] lg:text-[20px] font-medium lg:leading-[32px] tracking-[0.15px] text-[#353535]">
          90 Day Credit Terms for Qualified Partners
        </p>
      </div>

      {/* Buy with Confidence section */}
      <div className="mb-3 text-center lg:text-left text-[20px] lg:leading-[22px] lg:text-[24px] font-bold leading-[32px] text-[#353535]">
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
        <p className="text-left text-[16px] leading-[22px] lg:text-[20px] font-medium lg:leading-[32px] tracking-[0.15px] text-[#353535]">
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
        <p className="text-[16px] leading-[22px] text-left lg:text-[20px] font-medium lg:leading-[32px] tracking-[0.15px] text-[#353535]">
          Free Lifetime Warranty
        </p>
      </div>
    </div>
  );
};

export default TradeForm;