import { Button } from '@bigcommerce/reactant/Button';
import React from 'react';

export const Hero = () => {
  return (
    <div className="flex h-[640px] w-full items-center bg-gray-100 p-12 md:h-[508px] lg:h-[600px]">
      <div>
        <h1 className="text-h1">New collection</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </div>
    </div>
  );
};
