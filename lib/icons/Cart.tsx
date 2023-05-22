import * as React from 'react';
import { SVGProps } from 'react';

const SvgCart = (props: SVGProps<SVGSVGElement>) => (
  <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18 21a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM7 21a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 .98.804L6.82 5H23a1 1 0 0 1 .982 1.187l-1.601 8.398A3 3 0 0 1 19.39 17H9.69a3 3 0 0 1-2.99-2.414L5.03 6.239a.994.994 0 0 1-.017-.084L4.18 2H1a1 1 0 0 1-1-1Zm7.22 6 1.44 7.195a1 1 0 0 0 1 .805h9.76a1 1 0 0 0 .998-.802L21.792 7H7.221Z" />
  </svg>
);

export default SvgCart;
