import * as React from 'react';
import { SVGProps } from 'react';

const SvgChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg height={16} width={16} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clipRule="evenodd"
      d="M3.363 5.364a.9.9 0 0 1 1.273 0L8 8.727l3.363-3.363a.9.9 0 0 1 1.273 1.272l-4 4a.9.9 0 0 1-1.273 0l-4-4a.9.9 0 0 1 0-1.272Z"
    />
  </svg>
);

export default SvgChevronDown;
