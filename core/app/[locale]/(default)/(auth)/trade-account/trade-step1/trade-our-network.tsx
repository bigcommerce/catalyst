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
      <div className="mt-[20px] xl:mt-0 xl:p-0 mx-5  sm:mx-10 xl:mx-0 flex justify-center">
        <div className="relative overflow-x-auto bg-[#D7D7D7] w-full">
          <div className="flex flex-col xl:flex-row min-w-fit items-center justify-center gap-5 xl:gap-6 py-6">
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
    </>
  );
};

export default NetworkSection;