import * as React from 'react';
import { SVGProps } from 'react';

const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M12.707 5.293a1 1 0 0 1 0 1.414L7.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 0Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M20 12a1 1 0 0 1-1 1H6a1 1 0 1 1 0-2h13a1 1 0 0 1 1 1Z"
      fill-rule="evenodd"
    />
  </svg>
);

export default SvgArrowLeft;
