import * as React from 'react';
import { SVGProps } from 'react';

const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm-9 7a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z"
    />
    <path
      clip-rule="evenodd"
      d="M15.943 15.943a1 1 0 0 1 1.415 0l4.35 4.35a1 1 0 0 1-1.415 1.414l-4.35-4.35a1 1 0 0 1 0-1.414Z"
    />
  </svg>
);

export default SvgSearch;
