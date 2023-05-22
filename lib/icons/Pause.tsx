import * as React from 'react';
import { SVGProps } from 'react';

const SvgPause = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M13 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Zm2 1v14h2V5h-2ZM5 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4Zm2 1v14h2V5H7Z"
      fill-rule="evenodd"
    />
  </svg>
);

export default SvgPause;
