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
    <div className="w-full">
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
  );
};

export default NetworkSection;