import * as React from 'react';
import { SVGProps } from 'react';

const SvgGift = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      clip-rule="evenodd"
      d="M4 11a1 1 0 0 1 1 1v9h14v-9a1 1 0 1 1 2 0v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M1 7a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7Zm2 1v3h18V8H3Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M12 6a1 1 0 0 1 1 1v15a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M12.061 4.018C12.807 2.662 14.194 1 16.5 1a3.5 3.5 0 1 1 0 7H12a1 1 0 0 1-.98-1.196L12 7l-.98-.197V6.8l.001-.005.004-.016.011-.053c.01-.044.024-.106.044-.183a10.696 10.696 0 0 1 .982-2.525ZM13.346 6H16.5a1.5 1.5 0 0 0 0-3c-1.194 0-2.057.838-2.686 1.982A8.208 8.208 0 0 0 13.346 6Zm-.366 1.198Z"
      fill-rule="evenodd"
    />
    <path
      clip-rule="evenodd"
      d="M7.5 3a1.5 1.5 0 0 0 0 3h3.154a8.208 8.208 0 0 0-.468-1.018C9.557 3.838 8.694 3 7.5 3ZM12 7l.98-.197V6.8l-.001-.005-.004-.016a4.226 4.226 0 0 0-.055-.236 10.696 10.696 0 0 0-.982-2.525C11.194 2.662 9.807 1 7.5 1a3.5 3.5 0 1 0 0 7H12a1 1 0 0 0 .98-1.196L12 7Z"
      fill-rule="evenodd"
    />
  </svg>
);

export default SvgGift;
