import React from 'react';
import { BcImage } from '~/components/bc-image';

interface NetworkSectionProps {
  networkImages: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
}

const NetworkSection: React.FC<NetworkSectionProps> = ({ networkImages }) => {
  return (
    <>
    <div className="w-full hidden lg:block">
      <div className="relative overflow-x-auto bg-[#D7D7D7]">
        <div className="flex min-w-fit items-center justify-center gap-6 py-6">
          {networkImages.map((image, index) => (
            <BcImage
              key={index}
              alt={image.alt}
              width={image.width}
              height={image.height}
              src={image.src}
              className="h-10 w-auto"
              unoptimized={true}
            />
          ))}
        </div>
      </div>
    </div>
    <div className='flex justify-center w-full lg:hidden px-[20px]'>
      <div className='bg-white w-full'>
      <div className='py-[20px] flex flex-col gap-[20px] text-center'>
        <div className='font-[700] text-[24px] leading-[32px] text-[#353535]'>Our Network</div>
        <div className='flex flex-col gap-[20px] font-[400] text-[14px] leading-[24px] tracking-[0.25px] text-black'>
          <div>homeclickcom</div>
          <div>patioheatandshade</div>
          <div>baileystreethome</div>
          <div>1stoplighting</div>
          <div>lunawarehouse</div>
          <div>lunawarehouse</div>
          <div>canadalightingexperts</div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default NetworkSection;