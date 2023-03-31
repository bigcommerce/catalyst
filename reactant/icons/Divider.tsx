import React from 'react';

export const DividerIcon: React.FC<React.SVGAttributes<HTMLOrSVGElement>> = ({ ...props }) => {
  return (
    <svg height="10" viewBox="0 0 6 10" width="6" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        clipRule="evenodd"
        d="M0.363702 9.63679C0.0122297 9.28531 0.0122297 8.71547 0.363702 8.36399L3.72731 5.00039L0.363702 1.63679C0.0122297 1.28531 0.0122297 0.715466 0.363702 0.363995C0.715173 0.0125227 1.28502 0.0125227 1.63649 0.363995L5.63649 4.36399C5.98797 4.71547 5.98797 5.28531 5.63649 5.63679L1.63649 9.63679C1.28502 9.98826 0.715173 9.98826 0.363702 9.63679Z"
        fill="black"
        fillRule="evenodd"
      />
    </svg>
  );
};
