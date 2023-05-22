import * as React from 'react';
import { SVGProps } from 'react';

const SvgHeart = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M14.462 2.493a6.5 6.5 0 0 1 8.495 8.495 6.498 6.498 0 0 1-1.41 2.11s0-.001 0 0l-8.84 8.84a1 1 0 0 1-1.414 0l-8.84-8.84a6.501 6.501 0 0 1 9.194-9.195l.353.353.353-.353a6.501 6.501 0 0 1 2.109-1.41Zm2.488 1.505a4.5 4.5 0 0 0-3.183 1.319l-1.06 1.06a1 1 0 0 1-1.414 0l-1.06-1.06a4.501 4.501 0 1 0-6.366 6.366L12 19.816l8.133-8.133a4.501 4.501 0 0 0-3.183-7.685Z"
      fill-rule="evenodd"
    />
  </svg>
);

export default SvgHeart;
