import * as React from 'react';
import { SVGProps } from 'react';

const SvgArrowRight = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M11.293 18.707a1 1 0 0 1 0-1.414L16.586 12l-5.293-5.293a1 1 0 0 1 1.414-1.414l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414 0Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M4 12a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z"
      fill-rule="evenodd"
    />
  </svg>
);

export default SvgArrowRight;
