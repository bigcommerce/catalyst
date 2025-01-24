// components/ScrollButton.tsx

"use client";

import React, { useEffect } from "react";
import { BcImage } from "~/components/bc-image";
import ArrowDownIcon from '~/public/other/arrow_circle_down.svg';

interface ScrollButtonProps {
  targetId: string;
  accessoriesData: any;
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ targetId, accessoriesData }) => {

  useEffect(() => {
    localStorage.setItem('accessories_data', JSON.stringify(accessoriesData));
  }, []);

  const handleScroll = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button className="inline-flex items-center gap-2  font-medium leading-[32px] tracking-[0.15px] text-lg text-[#4EAECC]" onClick={handleScroll} aria-label="Scroll to order summary">
      Details <BcImage src={ArrowDownIcon} alt="Scroll Down" width={18} height={18} />
    </button>
  );
};

export default ScrollButton;

